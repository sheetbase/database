import {Options, Extendable} from '../types/database.type';

export class OptionService {
  private options: Options;

  constructor(options: Options) {
    this.options = {
      keyFields: {},
      security: {},
      securityHelpers: {},
      ...options,
    };
  }

  getOptions() {
    return this.options;
  }

  setOptions(options: Options | Extendable) {
    return (this.options = {...this.options, ...options});
  }
}
