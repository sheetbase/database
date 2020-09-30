/* eslint-disable no-undef */
import {
  Options,
  Extendable,
  Intergration,
  Filter,
  ListingFilter,
  LocalDatabase,
  DocsContentStyles,
  DataSegment,
  AuthToken,
} from '../types';
import {Ref} from '../ref';
import {HelperService} from './helper.service';
import {FilterService} from './filter.service';
import {Security} from '../security';

export class DatabaseService {
  private options: Options;
  private localDatabase: LocalDatabase;
  private spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet;
  private security: Security;

  constructor(
    private helperService: HelperService,
    private filterService: FilterService,
    options: Options
  ) {
    this.options = {
      keyFields: {},
      security: {},
      securityHelpers: {},
      ...options,
    };
    this.localDatabase = {};
    this.spreadsheet = SpreadsheetApp.openById(options.databaseId);
    this.security = new Security(this);
  }

  getOptions() {
    return this.options;
  }

  getLocalDatabase(sheetName?: string) {
    return sheetName ? this.localDatabase[sheetName] : this.localDatabase;
  }

  setLocalDatabase(sheetName: string, items: Record<string, unknown>) {
    return (this.localDatabase[sheetName] = items);
  }

  getSpreadsheet() {
    return this.spreadsheet;
  }

  getSecurity() {
    return this.security;
  }

  setIntegration<K extends keyof Intergration>(
    key: K,
    value: AuthToken
  ): DatabaseService {
    this.options[key] = value;
    return this;
  }

  extend(options: Extendable) {
    return new DatabaseService(this.helperService, this.filterService, {
      ...this.options,
      ...options,
    });
  }

  toAdmin() {
    return this.extend({security: false});
  }

  ref(path = '/') {
    return new Ref(
      this.helperService,
      this.filterService,
      this,
      path.split('/').filter(Boolean)
    );
  }

  key(length = 27, startWith = '-') {
    return this.ref().key(length, startWith);
  }

  data<Item>(sheetName: string) {
    return this.ref('/' + sheetName).toObject() as {[$key: string]: Item};
  }

  all<Item>(sheetName: string) {
    return this.ref('/' + sheetName).toArray() as Item[];
  }

  query<Item extends Record<string, unknown>>(
    sheetName: string,
    filter: Filter<Item>,
    segment?: DataSegment,
    listingFilter?: ListingFilter
  ) {
    return this.ref('/' + sheetName).query(
      filter,
      segment,
      listingFilter
    ) as Item[];
  }

  items<Item extends Record<string, unknown>>(
    sheetName: string,
    filter?: Filter<Item>,
    segment?: DataSegment,
    listingFilter?: ListingFilter
  ) {
    if (filter) {
      return this.query<Item>(sheetName, filter, segment, listingFilter);
    } else {
      return this.all<Item>(sheetName);
    }
  }

  item<Item extends Record<string, unknown>>(
    sheetName: string,
    finder: string | number | Filter<Item>,
    segment?: DataSegment
  ) {
    let item: Item | undefined;
    if (typeof finder === 'string') {
      const key = finder;
      item = this.ref('/' + sheetName + '/' + key).toObject() as Item;
    } else {
      if (typeof finder === 'number') {
        finder = {where: '#', equal: finder};
      }
      const items = this.query(sheetName, finder, segment);
      if (!!items && items.length === 1) {
        item = items[0] as Item;
      }
    }
    return item as Item;
  }

  set<Data>(sheetName: string, key: string, data: Data) {
    return this.ref('/' + sheetName + (key ? '/' + key : '')).set(data);
  }

  update<Data>(sheetName: string, key: string, data: Data) {
    return this.ref('/' + sheetName + (key ? '/' + key : '')).update(data);
  }

  add<Data>(sheetName: string, key: string, data: Data) {
    return this.update(sheetName, key, data);
  }

  remove(sheetName: string, key: string) {
    return this.update(sheetName, key, null);
  }

  increase(
    sheetName: string,
    key: string,
    increasing: string | string[] | {[path: string]: number}
  ) {
    return this.ref('/' + sheetName + (key ? '/' + key : '')).increase(
      increasing
    );
  }

  docsContent(docId: string, style: DocsContentStyles = 'clean') {
    DriveApp.getStorageUsed(); // trigger authorization

    // cache
    const cacheService = CacheService.getScriptCache();
    const cacheKey = 'content_' + docId + '_' + style;

    // get content
    let content = '';
    const cachedContent = cacheService ? cacheService.get(cacheKey) : null;
    if (cachedContent) {
      content = cachedContent;
    } else {
      // fetch
      const url =
        'https://www.googleapis.com/drive/v3/files/' +
        docId +
        '/export?mimeType=text/html';
      const response = UrlFetchApp.fetch(url, {
        method: 'get',
        headers: {
          Authorization: 'Bearer ' + ScriptApp.getOAuthToken(),
        },
        muteHttpExceptions: true,
      });
      // finalize content
      if (!!response && response.getResponseCode() === 200) {
        const html = response.getContentText();
        // original
        content = html || '';
        // full & clean
        if (style !== 'original') {
          // extract content, between: </head></html>
          const contentMatch = html.match(/<\/head>(.*)<\/html>/);
          if (contentMatch) {
            content = contentMatch.pop() || '';
          }

          // clean up
          content = content
            .replace(/<body(.*?)>/, '') // replace: <body...>
            .replace('</body>', '') // replace </body>
            .replace(/<script(.*?)<\/script>/g, '') // remove all script tag
            .replace(/<style(.*?)<\/style>/g, ''); // remove all style tag

          // replace redirect links
          const links = content.match(
            /"https:\/\/www\.google\.com\/url\?q=(.*?)"/g
          );
          if (links) {
            for (let i = 0, l = links.length; i < l; i++) {
              const link = links[i];
              const urlMatch = link.match(
                /"https:\/\/www\.google\.com\/url\?q=(.*?)&amp;/
              );
              if (urlMatch) {
                const url = urlMatch.pop();
                content = content.replace(link, '"' + url + '"');
              }
            }
          }

          // clean
          if (style === 'clean') {
            // remove all attributes
            const removeAttrs = ['style', 'id', 'class', 'width', 'height'];
            for (let i = 0, l = removeAttrs.length; i < l; i++) {
              content = content.replace(
                new RegExp(' ' + removeAttrs[i] + '="(.*?)"', 'g'),
                ''
              );
            }
          }
        }

        // save to cache
        if (cacheService) {
          try {
            cacheService.put(cacheKey, content, 3600); // 1 hour
          } catch (error) {
            // cache error (may be content larger 100K)
          }
        }
      } else {
        throw new Error('Fetch failed.');
      }
    }

    // return content
    return content;
  }
}
