import {RouteRequest} from '@sheetbase/server';

import {AuthData} from './types';
import {Ref} from './ref';
import {Snapshot} from './snapshot';
import {DatabaseService} from './services/database.service';

export class Security {
  private req: RouteRequest | undefined;
  private auth: AuthData | undefined;

  constructor(private databaseService: DatabaseService) {}

  setRequest(request: RouteRequest) {
    // req object
    this.req = request;
    // auth object
    const {AuthToken} = this.databaseService.getOptions();
    const idToken = request
      ? request.query['idToken'] || request.body['idToken']
      : null;
    if (!!idToken && !!AuthToken) {
      this.auth = AuthToken.decodeIdToken(idToken);
    }
  }

  checkpoint(
    permission: 'read' | 'write',
    paths: string[],
    ref: Ref,
    item?: unknown,
    data?: unknown
  ) {
    // read
    if (permission === 'read' && !this.hasPermission('read', paths, ref)) {
      throw new Error('No read permission.');
    }
    // write
    if (
      permission === 'write' &&
      !this.hasPermission('write', paths, ref, item, data)
    ) {
      throw new Error('No write permission.');
    }
  }

  private hasPermission(
    permission: 'read' | 'write',
    paths: string[],
    ref: Ref,
    item?: unknown,
    data?: unknown
  ): boolean {
    const {security} = this.databaseService.getOptions();
    // always when security is off
    if (!security) {
      return true;
    }
    // user claims has admin previledge
    if (!!this.auth && this.auth.isAdmin) {
      return true;
    }
    // execute rule
    const {rule, dynamicData} = this.parseRule(permission, paths);
    return typeof rule === 'boolean'
      ? rule
      : this.executeRule(rule as string, ref, item, data, dynamicData);
  }

  private executeRule(
    rule: string,
    ref: Ref,
    item?: unknown,
    data?: unknown,
    dynamicData: {[key: string]: string} = {}
  ) {
    const {securityHelpers: customHelpers} = this.databaseService.getOptions();
    // sum up input
    const input = {
      now: new Date(),
      req: this.req, // req object
      auth: this.auth, // auth object
      root: new Snapshot(ref.root(), customHelpers),
      data: new Snapshot(ref, customHelpers), // current ref data
      newData: new Snapshot(item, customHelpers), // item after processed update data
      inputData: new Snapshot(data, customHelpers), // only update input data
      ...dynamicData,
    };
    const body = `
            Object.keys(input).map(function (k) {
                this[k] = input[k];
            });
            return (${rule});
        `;
    // run
    try {
      const executor = new Function('input', body);
      return executor(input);
    } catch (error) {
      return false;
    }
  }

  private parseRule(permission: 'read' | 'write', paths: string[]) {
    const {security} = this.databaseService.getOptions();

    // prepare
    let rules: Record<string, unknown> = {};
    if (security === false) {
      // implicit no security (public)
      rules = {'.read': true, '.write': true};
    } else if (!security || security === true) {
      // undefined or null or true (private)
      rules = {'.read': false, '.write': false};
    } else {
      // rule based
      rules = security;
    }
    const latestRules: Record<string, unknown> = {
      '.read': rules['.read'] || false,
      '.write': rules['.write'] || false,
    };
    const dynamicData: {[key: string]: string} = {};

    // get data
    for (let i = 0; i < paths.length; i++) {
      // current step values
      const path = paths[i];
      let dynamicKey = '';

      // set rules
      const nextRules = rules[path] as Record<string, unknown>;
      if (!!nextRules && nextRules instanceof Object) {
        rules = nextRules;
      } else {
        // get latest dynamic key
        Object.keys(rules).forEach(k => {
          if (k.substr(0, 1) === '$') {
            dynamicKey = k;
          }
        });
        // if it have any dynamic key, use it
        const dynamicRules = dynamicKey
          ? (rules[dynamicKey] as Record<string, unknown>)
          : null;
        if (!!dynamicRules && dynamicRules instanceof Object) {
          rules = dynamicRules;
        } else {
          rules = {};
        }
      }

      // set latestRules
      const {'.read': read, '.write': write} = rules as Record<string, unknown>;
      if (read === false || !!read) {
        latestRules['.read'] = read;
      }
      if (write === false || !!write) {
        latestRules['.write'] = write;
      }

      // set dynamicData
      if (dynamicKey) {
        dynamicData[dynamicKey] = path;
      }
    }

    // set rule
    const endedRule = rules['.' + permission];
    const rule =
      endedRule === false || !!endedRule
        ? endedRule
        : latestRules['.' + permission];

    // return data
    return {rule, dynamicData};
  }
}
