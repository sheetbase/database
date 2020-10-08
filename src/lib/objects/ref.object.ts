import {Filter, ListingFilter, DataSegment} from '../types/database.type';
import {OptionService} from '../services/option.service';
import {HelperService} from '../services/helper.service';
import {FilterService} from '../services/filter.service';
import {SecurityService} from '../services/security.service';
import {DatabaseService} from '../services/database.service';

export class RefObject {
  private paths: string[];

  constructor(
    private optionService: OptionService,
    private helperService: HelperService,
    private filterService: FilterService,
    private securityService: SecurityService,
    private databaseService: DatabaseService,
    paths: string[]
  ) {
    this.paths = paths;
  }

  private keyField(sheetName: string) {
    return (
      (this.optionService.getOptions().keyFields || {})[sheetName] || '$key'
    );
  }

  // load sheet data
  private loadDataBySheet<Item extends Record<string, unknown>>(
    sheetName: string,
    fresh = false
  ) {
    if (!this.databaseService.getLocalDatabase(sheetName) || fresh) {
      // load raw items
      const rawItems = this.helperService.translateRangeValues(
        this.databaseService
          .getSpreadsheet()
          .getRange(sheetName + '!A1:ZZ')
          .getValues()
      );
      // process items
      const items: Record<string, Item> = {};
      for (let i = 0; i < rawItems.length; i++) {
        const item = this.helperService.parseData<Item>(
          rawItems[i] as Item
        ) as Record<string, unknown>;
        // get item key
        const key = item[this.keyField(sheetName)] as string;
        // add '$key' field
        item['$key'] = key;
        // set items
        items[key] = item as Item;
      }
      // save to database
      this.databaseService.setLocalDatabase(sheetName, items);
    }
    return this.databaseService.getLocalDatabase(sheetName);
  }

  // load all data
  private loadRootData() {
    // load all sheets
    const sheets = this.databaseService.getSpreadsheet().getSheets();
    // load data sheet by sheet
    for (let i = 0; i < sheets.length; i++) {
      const sheetName = sheets[i].getName();
      if (
        sheetName.substr(0, 2) === '__' &&
        sheetName.substr(sheetName.length - 2, 2) === '__'
      ) {
        // meta sheets
        // ignore
      } else {
        this.loadDataBySheet(sheetName);
      }
    }
    return this.databaseService.getLocalDatabase();
  }

  // get data at this ref location
  private data() {
    const [sheetName, ...paths] = this.paths;
    let data: Record<string, unknown> | null = {};
    if (!sheetName) {
      // root data
      data = {...this.loadRootData()};
    } else {
      // sheet data
      data = {...this.loadDataBySheet(sheetName)};
    }
    // get deep
    for (let i = 0; i < paths.length; i++) {
      if (data instanceof Object) {
        data = (data[paths[i]] as Record<string, unknown>) || null;
      } else {
        data = null;
        break;
      }
    }
    return data;
  }

  /**
   * ref navigation
   */
  root() {
    return new RefObject(
      this.optionService,
      this.helperService,
      this.filterService,
      this.securityService,
      this.databaseService,
      []
    );
  }

  parent() {
    const paths = [...this.paths];
    if (paths.length > 0) {
      paths.pop();
      return new RefObject(
        this.optionService,
        this.helperService,
        this.filterService,
        this.securityService,
        this.databaseService,
        paths
      );
    } else {
      return this.root();
    }
  }

  child(path: string) {
    const childPaths = path.split('/').filter(Boolean);
    const paths = [...this.paths, ...childPaths];
    return new RefObject(
      this.optionService,
      this.helperService,
      this.filterService,
      this.securityService,
      this.databaseService,
      paths
    );
  }

  /**
   * read data
   */

  generateKey(length = 27, startWith = '-') {
    return this.helperService.uniqueId(length, startWith);
  }

  toObject() {
    this.securityService.checkpoint('read', this.paths, this);
    return this.data() || {};
  }

  toArray() {
    return this.helperService.o2a(this.toObject()) as unknown[];
  }

  query<Item extends Record<string, unknown>>(
    filter: Filter<Item>,
    segment?: DataSegment,
    listingFilter?: ListingFilter
  ) {
    if (this.paths.length === 1) {
      // filters
      const advancedFilter = this.filterService.buildAdvancedFilter(filter);
      const segmentFilter = segment
        ? this.filterService.buildSegmentFilter<Item>(segment)
        : () => true;
      // get items
      const items: Item[] = [];
      // go through items, filter and check for security
      const rawItems = this.data();
      if (!rawItems) {
        throw new Error('No data!');
      }
      for (const key of Object.keys(rawItems)) {
        const item = rawItems[key] as Item;
        if (!!segmentFilter(item) && !!advancedFilter(item)) {
          const itemRef = this.child(key);
          this.securityService.checkpoint('read', itemRef.paths, itemRef);
          items.push(item);
        }
      }
      return this.filterService.applyListingFilter(items, listingFilter);
    } else {
      throw new Error('Can only query list ref.');
    }
  }

  /**
   * add/update/remove/...
   */

  set<Item, Data>(data?: Data): Item | null {
    return this.update(data, true);
  }

  update<Item, Data>(data?: Data, clean = false): Item | null {
    if (this.paths.length > 0) {
      const [sheetName, _itemKey] = this.paths;

      // get sheet
      const sheet = this.databaseService
        .getSpreadsheet()
        .getSheetByName(sheetName);

      if (!sheet) {
        throw new Error('Error getting sheet: ' + sheetName);
      }

      // get item
      const items = this.loadDataBySheet(sheetName);
      const itemKey = _itemKey || this.generateKey();
      let item = items[itemKey] as Record<string, unknown>;

      // determine which action
      let action: 'remove' | 'update' | 'new' | undefined;
      if (!data && !!item) {
        // remove
        action = 'remove';
      } else if (!!data && !!item) {
        // update
        action = 'update';
      } else if (!!data && !item) {
        // new
        action = 'new';
      }

      // prepare data
      let _row: number | undefined;
      if (!action) {
        throw new Error('No action (invalid update data).');
      } else if (action === 'remove') {
        // remove
        _row = item._row as number;
      } else if (action === 'update') {
        // update
        _row = item._row as number;
        const newItem = {
          ...data,
          '#': item['#'],
          [this.keyField(sheetName)]: itemKey,
          _row,
        };
        if (clean) {
          // set
          item = newItem;
        } else {
          // update
          item = {
            ...item,
            ...newItem,
          };
        }
      } else if (action === 'new') {
        // new
        const lastRow = sheet.getLastRow();
        const lastItemId = sheet
          .getRange('A' + lastRow + ':' + lastRow)
          .getValues()[0][0];
        _row = lastRow + 1;
        item = {
          ...data,
          '#': !isNaN(lastItemId) ? lastItemId + 1 : 1,
          [this.keyField(sheetName)]: itemKey,
          _row,
        };
      }

      // check permission
      this.securityService.checkpoint('write', this.paths, this, item, data);

      // build range values
      const rangeValues = [];
      const [headers] = sheet.getRange('A1:1').getValues();
      for (let i = 0; i < headers.length; i++) {
        if (action === 'remove') {
          rangeValues.push('');
        } else {
          let value = item[headers[i]];
          // stringify
          if (value instanceof Object) {
            value = JSON.stringify(value);
          }
          rangeValues.push(value || '');
        }
      }

      // set snapshot database
      if (action === 'remove') {
        // remove
        delete items[itemKey];
      } else {
        // update / new
        items[itemKey] = item;
      }

      // set live database
      if (!_row) {
        throw new Error('Invalid updating row!');
      }
      sheet.getRange('A' + _row + ':' + _row).setValues([rangeValues]);
      return action === 'remove' ? null : (item as Item);
    } else {
      throw new Error('Can only modify list ref (new) and item ref.');
    }
  }

  increase(increasing: string | string[] | Record<string, unknown>) {
    if (this.paths.length === 2) {
      const item = this.data();
      if (!item) {
        throw new Error('No item for increasing!');
      }
      const data: Record<string, unknown> = {}; // changed data
      // turn a path or array of paths to increasing object
      if (typeof increasing === 'string') {
        increasing = {[increasing]: 1};
      } else if (increasing instanceof Array) {
        const _increasing: Record<string, unknown> = {};
        for (let i = 0; i < increasing.length; i++) {
          _increasing[increasing[i]] = 1;
        }
        increasing = _increasing;
      }
      // increase props
      for (const path of Object.keys(increasing)) {
        const [itemKey, childKey] = path.split('/').filter(Boolean);
        const increasedBy = (increasing[path] as number) || 1;
        if (!isNaN(increasedBy as number)) {
          // only number
          // set value
          if (childKey) {
            // deep props
            const child = (item[itemKey] || {}) as Record<string, unknown>;
            // only apply for object
            if (child instanceof Object) {
              // only for number prop
              if (
                !child[childKey] ||
                (!!child[childKey] && typeof child[childKey] === 'number')
              ) {
                // set child
                child[childKey] =
                  ((child[childKey] as number) || 0) + increasedBy;
                // set item
                item[itemKey] = child;
                // set changed
                data[itemKey] = child;
              }
            }
          } else {
            // direct prop
            // only for number prop
            if (
              !item[itemKey] ||
              (!!item[itemKey] && typeof item[itemKey] === 'number')
            ) {
              // set item
              item[itemKey] = ((item[itemKey] as number) || 0) + increasedBy;
              // set changed
              data[itemKey] = item[itemKey];
            }
          }
        }
      }
      // finally
      // save changed data to database
      this.update(data);
      return item;
    } else {
      throw new Error('Can only increasing item ref.');
    }
  }
}
