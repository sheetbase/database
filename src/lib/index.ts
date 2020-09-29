import {ServerModule, DisabledRoutes} from '@sheetbase/server';

import {Options} from './types';
import {HelperService} from './services/helper.service';
import {FilterService} from './services/filter.service';
import {DatabaseService} from './services/database.service';
import {DatabaseRoute} from './routes/database.route';
import {DatabaseContentRoute} from './routes/database-content.route';

export class Lib {
  helperService: HelperService;
  filterService: FilterService;
  databaseService: DatabaseService;
  databaseRoute: DatabaseRoute;
  databaseContentRoute: DatabaseContentRoute;

  constructor(private serverModule: ServerModule, options: Options) {
    // services
    this.helperService = new HelperService();
    this.filterService = new FilterService(this.helperService);
    this.databaseService = new DatabaseService(
      this.helperService,
      this.filterService,
      options
    );
    // routes
    this.databaseRoute = new DatabaseRoute();
    this.databaseContentRoute = new DatabaseContentRoute();
  }

  /**
   * Expose the module routes
   */
  registerRoutes(routeEnabling?: true | DisabledRoutes) {
    return this.serverModule.routerService.register(
      [this.databaseRoute, this.databaseContentRoute],
      routeEnabling
    );
  }
}
