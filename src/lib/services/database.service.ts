import {
  Filter,
  ListingFilter,
  LocalDatabase,
  DocsContentStyles,
  DataSegment,
} from '../types/database.type';
import {OptionService} from './option.service';
import {HelperService} from './helper.service';
import {FilterService} from './filter.service';
import {SecurityService} from '../services/security.service';
import {RefObject} from '../objects/ref.object';

export class DatabaseService {
  private localDatabase: LocalDatabase;
  private spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet;

  constructor(
    private optionService: OptionService,
    private helperService: HelperService,
    private filterService: FilterService,
    private sercurityService: SecurityService
  ) {
    this.localDatabase = {};
    // eslint-disable-next-line no-undef
    this.spreadsheet = SpreadsheetApp.openById(
      this.optionService.getOptions().databaseId
    );
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

  ref(path = '/') {
    return new RefObject(
      this.optionService,
      this.helperService,
      this.filterService,
      this.sercurityService,
      this,
      path.split('/').filter(Boolean)
    );
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
    // eslint-disable-next-line no-undef
    DriveApp.getStorageUsed(); // trigger authorization

    // cache
    // eslint-disable-next-line no-undef
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
      // eslint-disable-next-line no-undef
      const response = UrlFetchApp.fetch(url, {
        method: 'get',
        headers: {
          // eslint-disable-next-line no-undef
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
