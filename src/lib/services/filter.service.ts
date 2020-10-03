import {
  Filter,
  AdvancedFilter,
  ShorthandQuery,
  SingleQuery,
  MultiQuery,
  DataSegment,
  ListingFilter,
} from '../types/database.type';
import {HelperService} from './helper.service';

export class FilterService {
  constructor(private helperService: HelperService) {}

  convertShorthandQueryToSingleQuery(shorthandQuery: ShorthandQuery) {
    const where = Object.keys(shorthandQuery)[0];
    const equal = shorthandQuery[where];
    return {where, equal} as SingleQuery;
  }

  convertSingleQueryToAdvancedFilter<Item extends Record<string, unknown>>(
    singleQuery: SingleQuery
  ) {
    let advancedFilter: AdvancedFilter<Item> = () => true;
    // build advanced filter
    if (!!singleQuery && !!singleQuery.where) {
      const {
        where,
        equal,
        exists,
        contains,
        lt,
        lte,
        gt,
        gte,
        childExists,
        childEqual,
      } = singleQuery;
      // where/equal
      if (equal) {
        advancedFilter = item => !!item[where] && item[where] === equal;
      }
      // where/exists/not exists
      else if (typeof exists === 'boolean') {
        advancedFilter = item => (exists ? !!item[where] : !item[where]);
      }
      // where/contains
      else if (contains) {
        advancedFilter = item =>
          typeof item[where] === 'string' &&
          (item[where] as string).indexOf(contains) > -1;
      }
      // where/less than
      else if (lt) {
        advancedFilter = item =>
          typeof item[where] === 'number' && (item[where] as number) < lt;
      }
      // where/less than or equal
      else if (lte) {
        advancedFilter = item =>
          typeof item[where] === 'number' && (item[where] as number) <= lte;
      }
      // where/greater than
      else if (gt) {
        advancedFilter = item =>
          typeof item[where] === 'number' && (item[where] as number) > gt;
      }
      // where/greater than or equal
      else if (gte) {
        advancedFilter = item =>
          typeof item[where] === 'number' && (item[where] as number) >= gte;
      }
      // where/child exists, not exists
      else if (childExists) {
        const notExists = childExists.substr(0, 1) === '!';
        const child = notExists ? childExists.replace('!', '') : childExists;
        advancedFilter = item => {
          if (!item[where] && notExists) {
            return true; // child always not exists
          } else if (item[where]) {
            if (item[where] instanceof Array) {
              return notExists
                ? (item[where] as unknown[]).indexOf(child) < 0
                : (item[where] as unknown[]).indexOf(child) > -1;
            } else if (item[where] instanceof Object) {
              return notExists
                ? !(item[where] as Record<string, unknown>)[child]
                : !!(item[where] as Record<string, unknown>)[child];
            }
          }
          return false;
        };
      }
      // where/child equal, not equal
      else if (childEqual) {
        let notEqual: boolean;
        let childKey: string;
        let childValue: unknown;
        if (childEqual.indexOf('!=') > -1) {
          notEqual = true;
          const keyValue = childEqual.split('!=').filter(Boolean);
          childKey = keyValue[0];
          childValue = keyValue[1];
        } else {
          const keyValue = childEqual.split('=').filter(Boolean);
          childKey = keyValue[0];
          childValue = keyValue[1];
        }
        if (!isNaN(childValue as number)) {
          childValue = Number(childValue);
        }
        advancedFilter = item => {
          if (!item[where] && notEqual) {
            return true; // always not equal
          } else if (item[where]) {
            return (
              item[where] instanceof Object &&
              (notEqual
                ? !(item[where] as Record<string, unknown>)[childKey] ||
                  (item[where] as Record<string, unknown>)[childKey] !==
                    childValue
                : !!(item[where] as Record<string, unknown>)[childKey] &&
                  (item[where] as Record<string, unknown>)[childKey] ===
                    childValue)
            );
          }
          return false;
        };
      }
      // ...
    }
    return advancedFilter;
  }

  convertMultiQueryToAdvancedFilter<Item extends Record<string, unknown>>(
    multiQuery: MultiQuery
  ) {
    const {and = [], or = []} = multiQuery || {};
    let advancedFilter: AdvancedFilter<Item>;
    // invalid
    if (!and.length && !or.length) {
      advancedFilter = () => true;
    }
    // no OR, single AND
    else if (!or && and.length === 1) {
      advancedFilter = this.convertSingleQueryToAdvancedFilter(and[0]);
    }
    // no AND, single OR
    else if (!and && or.length === 1) {
      advancedFilter = this.convertSingleQueryToAdvancedFilter(or[0]);
    }
    // multiple
    else {
      // AND filters
      const andFilters: Array<AdvancedFilter<Item>> = [];
      for (const query of and) {
        andFilters.push(this.convertSingleQueryToAdvancedFilter(query));
      }
      // OR filters
      const orFilters: Array<AdvancedFilter<Item>> = [];
      for (const query of or) {
        orFilters.push(this.convertSingleQueryToAdvancedFilter(query));
      }
      // advanced filter
      advancedFilter = item => {
        let matched = false;
        // check AND
        if (andFilters.length) {
          matched = true;
          for (const advancedFilter of andFilters) {
            if (!advancedFilter(item)) {
              matched = false;
              break;
            }
          }
        }
        // check OR
        if (orFilters.length) {
          let orMatched = false;
          for (const advancedFilter of orFilters) {
            if (advancedFilter(item)) {
              orMatched = true;
              break;
            }
          }
          matched = orMatched || matched;
        }
        // result
        return matched;
      };
    }
    // result
    return advancedFilter;
  }

  buildAdvancedFilter<Item extends Record<string, unknown>>(
    filter: Filter<Item>
  ) {
    let advancedFilter: AdvancedFilter<Item>;
    // advanced filter
    if (filter instanceof Function) {
      advancedFilter = filter;
    } else {
      // multi query
      if (!!(filter as MultiQuery)['and'] || !!(filter as MultiQuery)['or']) {
        advancedFilter = this.convertMultiQueryToAdvancedFilter(
          filter as MultiQuery
        );
      }
      // ShorthandQuery or SingleQuery
      else {
        if (!(filter as ShorthandQuery | SingleQuery)['where']) {
          // shorthand
          filter = this.convertShorthandQueryToSingleQuery(
            filter as ShorthandQuery
          );
        }
        advancedFilter = this.convertSingleQueryToAdvancedFilter(
          filter as SingleQuery
        );
      }
    }
    return advancedFilter;
  }

  buildSegmentFilter<Item extends Record<string, unknown>>(
    segment: DataSegment
  ) {
    const segmentFilter: AdvancedFilter<Item> = item => {
      let result = false;
      const segmentArr = Object.keys(segment || {});
      if (!segmentArr.length) {
        result = true;
      }
      // from 1-3
      else if (segmentArr.length < 4) {
        const [first, second, third] = segmentArr;
        result =
          // 1st
          (!item[first] || item[first] === segment[first]) &&
          // 2nd
          (!second || !item[second] || item[second] === segment[second]) &&
          // 3rd
          (!third || !item[third] || item[third] === segment[third]);
      }
      // over 3
      else {
        result = true; // assumpt
        for (let i = 0; i < segmentArr.length; i++) {
          const seg = segmentArr[i];
          // any not matched
          if (!!item[seg] && item[seg] !== segment[seg]) {
            result = false;
            break;
          }
        }
      }
      return result;
    };
    return segmentFilter;
  }

  applyListingFilter<Item>(items: Item[], listingFilter: ListingFilter = {}) {
    // ordering
    let {order, orderBy} = listingFilter;
    orderBy = !orderBy && !!order ? ['#'] : orderBy; // default orderBy
    if (orderBy) {
      orderBy = typeof orderBy === 'string' ? [orderBy] : orderBy;
      if (order) {
        order = typeof order === 'string' ? [order] : order;
      } else {
        order = new Array(orderBy.length).fill('asc');
      }
      items = this.helperService.orderBy(items, orderBy, order as string[]);
    }
    // limitation
    const {limit = 0, offset = 0} = listingFilter;
    // offset
    if (offset) {
      if (offset < 0) {
        items = items.slice(0, items.length + offset);
      } else {
        items = items.slice(offset, items.length);
      }
    }
    // limit
    if (limit) {
      if (limit < 0) {
        items = items.slice(items.length + limit, items.length);
      } else {
        items = items.slice(0, limit);
      }
    }
    return items;
  }
}
