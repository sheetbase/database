import {orderBy} from '../../lodash/orderby';

export class HelperService {
  constructor() {}

  // turn [[],[], ...] to [{},{}, ...]
  translateRangeValues<Item extends Record<string, unknown>>(
    values: unknown[][],
    noHeader = false,
    modifier = (item: Item) => item
  ) {
    values = values || [];
    // get header
    const headers = !noHeader ? (values.shift() as string[]) : [];
    // build data
    const result: Item[] = [];
    for (let i = 0; i < values.length; i++) {
      const item: Record<string, unknown> = {};
      // process columns
      const rows = values[i] || [];
      for (let j = 0; j < rows.length; j++) {
        if (rows[j]) {
          item[headers[j] || 'value' + (j + 1)] = rows[j];
        }
      }
      if (Object.keys(item).length > 0) {
        item['_row'] = !noHeader ? i + 2 : i + 1;
        result.push(modifier(item as Item));
      }
    }
    return result;
  }

  // convert string of data load from spreadsheet to correct data type
  parseData<Item extends Record<string, unknown>>(
    item: Record<string, unknown>
  ): Item {
    for (const key of Object.keys(item)) {
      if (item[key] === '' || item[key] === null || item[key] === undefined) {
        // delete null key
        delete item[key];
      } else if ((item[key] + '').toLowerCase() === 'true') {
        // boolean TRUE
        item[key] = true;
      } else if ((item[key] + '').toLowerCase() === 'false') {
        // boolean FALSE
        item[key] = false;
      } else if (!isNaN(item[key] as number)) {
        // number
        item[key] = Number(item[key]);
      } else if (
        typeof item[key] === 'string' &&
        (((item[key] as string).substr(0, 1) === '{' &&
          (item[key] as string).substr(-1) === '}') ||
          ((item[key] as string).substr(0, 1) === '[' &&
            (item[key] as string).substr(-1) === ']'))
      ) {
        // JSON
        try {
          item[key] = JSON.parse(item[key] as string);
        } catch (e) {
          // continue
        }
      }
    }
    return item as Item;
  }

  o2a<
    Obj extends Record<string, unknown>,
    K extends keyof Obj,
    P extends Obj[K],
    R extends Array<(P extends Obj ? P : {value: P}) & {$key: string}>
  >(object: Record<string, unknown>, keyName = '$key'): R {
    const arr = [] as unknown[];
    for (const key of Object.keys(object || {})) {
      if (object[key] instanceof Object) {
        (object[key] as Record<string, unknown>)[keyName] = key;
      } else {
        const value = object[key];
        object[key] = {};
        (object[key] as Record<string, unknown>)[keyName] = key;
        (object[key] as Record<string, unknown>)['value'] = value;
      }
      arr.push(object[key]);
    }
    return arr as R;
  }

  uniqueId(length = 12, startWith = '-'): string {
    const maxLoop = length - 8;
    const ASCII_CHARS =
      startWith +
      '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz';
    let lastPushTime = 0;
    const lastRandChars = [];
    let now = new Date().getTime();
    const duplicateTime = now === lastPushTime;
    lastPushTime = now;
    const timeStampChars = new Array(8);
    let i;
    for (i = 7; i >= 0; i--) {
      timeStampChars[i] = ASCII_CHARS.charAt(now % 64);
      now = Math.floor(now / 64);
    }
    let uid = timeStampChars.join('');
    if (!duplicateTime) {
      for (i = 0; i < maxLoop; i++) {
        lastRandChars[i] = Math.floor(Math.random() * 64);
      }
    } else {
      for (i = maxLoop - 1; i >= 0 && lastRandChars[i] === 63; i--) {
        lastRandChars[i] = 0;
      }
      lastRandChars[i]++;
    }
    for (i = 0; i < maxLoop; i++) {
      uid += ASCII_CHARS.charAt(lastRandChars[i]);
    }
    return uid;
  }

  orderBy<Item>(
    collection: Item[],
    iteratees: string[],
    orders: string[],
    guard?: unknown
  ) {
    return orderBy(collection, iteratees, orders, guard);
  }
}
