import {SnapshotObject} from '../objects/snapshot.object';

export interface Options {
  databaseId: string;
  keyFields?: {
    [sheetName: string]: string;
  };
  security?: boolean | {};
  securityHelpers?: SecurityHelpers;
}

export interface AuthData {
  uid: string;
  sub: string;
  tty: 'ID';
  [claim: string]: unknown;
}

export type Filter<Item> = Query | AdvancedFilter<Item>;

export type AdvancedFilter<Item> = (item: Item) => boolean;

export type Query = ShorthandQuery | SingleQuery | MultiQuery;

export type ShorthandQuery = Record<string, unknown>;

export interface SingleQuery {
  where: string;
  equal?: unknown;
  exists?: boolean;
  contains?: string;
  lt?: number;
  lte?: number;
  gt?: number;
  gte?: number;
  childExists?: string;
  childEqual?: string;
}

export interface MultiQuery {
  and?: SingleQuery[];
  or?: SingleQuery[];
}

export type ListingOrder = 'asc' | 'desc';

export interface ListingFilter {
  order?: ListingOrder | ListingOrder[];
  orderBy?: string | string[];
  limit?: number; // +/- limit to first/last
  offset?: number;
}

export interface SecurityHelpers {
  [name: string]: (snapshot: SnapshotObject) => unknown;
}

export interface LocalDatabase {
  [sheetName: string]: Record<string, unknown>;
}

export type DocsContentStyles = 'clean' | 'full' | 'original';

export type DataSegment = Record<string, unknown>;
