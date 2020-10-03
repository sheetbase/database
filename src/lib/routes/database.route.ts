import {RouteResponse} from '@sheetbase/server';

import {Query, DataSegment, ListingFilter} from '../types/database.type';
import {DatabaseService} from '../services/database.service';

export class DatabaseRoute {
  endpoint = '/database';

  disabled = ['post', 'put', 'patch', 'delete'];

  errors = {
    'database/no-input': 'No path/table/sheet.',
  };

  constructor(private databaseService: DatabaseService) {}

  /**
   * Get data from the database
   * @param query.path - Get data by path
   * @param query.table - The sheet name
   * @param query.sheet - The sheet name
   * @param query.id - The item key
   * @param query.key - The item key
   * @param query.type - Result as object or array (list)
   * @param query.query - URI encoded query object
   * @param query.segment - URI encoded segment object
   * @param query.order - List order
   * @param query.orderBy - List order by
   * @param query.limit - List limit
   * @param query.offset - List offset
   */
  get(req: {
    query: {
      path?: string;
      table?: string;
      sheet?: string;
      id?: string;
      key?: string;
      type?: 'list' | 'object';
      query?: string;
      segment?: string;
      order?: string;
      orderBy?: string;
      limit?: number;
      offset?: number;
    };
  }) {
    const {
      path = '/', // sheet name or item key
      table,
      sheet, // sheet name
      id,
      key, // item key
      // type
      type = 'list',
      // query, segment
      query: encodedQuery,
      segment: encodedSegment,
      // listing
      order,
      orderBy,
      limit,
      offset,
    } = req.query;
    const paths = path.split('/').filter(Boolean);
    const sheetName = table || sheet || paths[0];
    const itemKey = id || key || paths[1];

    if (!sheetName) {
      throw new Error('database/no-input');
    }

    return (() => {
      // single item
      if (itemKey) {
        return this.databaseService.item(sheetName, itemKey);
      }
      // query
      else if (encodedQuery) {
        // parse data
        const query = JSON.parse(decodeURIComponent(encodedQuery)) as Query;
        const segment = !encodedSegment
          ? undefined
          : (JSON.parse(decodeURIComponent(encodedSegment)) as DataSegment);
        const listingFilter = {
          order,
          orderBy,
          limit,
          offset,
        } as ListingFilter;
        // run query
        return this.databaseService.query(
          sheetName,
          query,
          segment,
          listingFilter
        );
      }
      // as object
      else if (type === 'object') {
        return this.databaseService.data(sheetName);
      }
      // all
      else {
        return this.databaseService.all(sheetName);
      }
    })();
  }

  /**
   * Add/update/delete data from database
   */
  post(req: {
    body: {
      path: string;
      table?: string;
      sheet?: string;
      id?: string;
      key?: string;
      data?: unknown;
      increasing?: Record<string, number>;
      clean?: boolean;
    };
  }) {
    const {
      path = '/', // sheet name and item key
      table,
      sheet, // sheet name
      id,
      key, // item key
      data, // data
      increasing, //increasing
      clean = false, // set or update
    } = req.body;
    const paths = path.split('/').filter(Boolean);
    const sheetName = table || sheet || paths[0];
    const itemKey = id || key || paths[1] || undefined;

    if (!sheetName || !itemKey) {
      throw new Error('database/no-input');
    }

    if (increasing) {
      this.databaseService.increase(sheetName, itemKey, increasing);
    } else if (clean) {
      this.databaseService.set(sheetName, itemKey, data);
    } else {
      this.databaseService.update(sheetName, itemKey, data);
    }
  }

  /**
   * Add a new item do the database (proxy to: post /database)
   */
  put(req: {
    body: {
      path: string;
      table?: string;
      sheet?: string;
      id?: string;
      key?: string;
      data?: unknown;
    };
  }) {
    (req.body as Record<string, unknown>).clean = true;
    return this.post(req);
  }

  /**
   * Update an item from the database (proxy to: post /database)
   */
  patch(req: {
    body: {
      path: string;
      table?: string;
      sheet?: string;
      id?: string;
      key?: string;
      data?: unknown;
    };
  }) {
    return this.post(req);
  }

  /**
   * Delete an item from the database (proxy to: post /database)
   */
  delete(req: {
    body: {
      path: string;
      table?: string;
      sheet?: string;
      id?: string;
      key?: string;
    };
  }) {
    return this.post(req);
  }
}
