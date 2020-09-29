export class DatabaseRoute {
  endpoint = '/database';

  disabled = ['post', 'put', 'patch', 'delete'];

  constructor() {}

  get() {
    return 'GET /database';
  }

  post() {}

  put() {}

  patch() {}

  delete() {}
}
