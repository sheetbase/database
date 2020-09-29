import {SecurityHelpers} from './types';
import {Ref} from './ref';

export class Snapshot {
  private input: Ref | unknown;
  private securityHelpers: SecurityHelpers | undefined;
  private isRef = false;

  constructor(input: Ref | unknown, securityHelpers?: SecurityHelpers) {
    this.input = input;
    this.securityHelpers = securityHelpers;
    // input is ref or data
    if (input instanceof Ref) {
      this.isRef = true;
    }
    // add helpers
    if (this.securityHelpers) {
      for (const key of Object.keys(this.securityHelpers)) {
        const helper = this.securityHelpers[key];
        (this as Record<string, unknown>)[key] = () => helper(this);
      }
    }
  }

  // get data
  val() {
    if (this.isRef) {
      return (this.input as Ref)['data']();
    } else {
      return this.input;
    }
  }

  // only props
  only(props = []) {
    const data = this.val();
    if (!props || !props.length) {
      return true;
    } else if (!!data && data instanceof Object) {
      const _data = {...data};
      for (let i = 0; i < props.length; i++) {
        const prop = props[i];
        delete _data[prop];
      }
      return Object.keys(_data).length === 0;
    } else {
      return false;
    }
  }
}
