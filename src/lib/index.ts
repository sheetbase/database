import {ServerModule, DisabledRoutes} from '@sheetbase/server';

import {Options} from './types/database.type';

import {OptionService} from './services/option.service';
import {HelperService} from './services/helper.service';
import {FilterService} from './services/filter.service';
import {SecurityService} from './services/security.service';
import {DatabaseService} from './services/database.service';

import {DatabaseMiddleware} from './middlewares/database.middleware';

import {DatabaseRoute} from './routes/database.route';
import {DatabaseContentRoute} from './routes/database-content.route';

export class Lib {
  optionService: OptionService;
  helperService: HelperService;
  filterService: FilterService;
  securityService: SecurityService;
  databaseService: DatabaseService;
  databaseMiddleware: DatabaseMiddleware;
  databaseRoute: DatabaseRoute;
  databaseContentRoute: DatabaseContentRoute;

  constructor(private serverModule: ServerModule, options: Options) {
    // services
    this.optionService = new OptionService(options);
    this.helperService = new HelperService();
    this.filterService = new FilterService(this.helperService);
    this.securityService = new SecurityService(this.optionService);
    this.databaseService = new DatabaseService(
      this.optionService,
      this.helperService,
      this.filterService,
      this.securityService
    );
    // middlewares
    this.databaseMiddleware = new DatabaseMiddleware(this.securityService);
    // routes
    this.databaseRoute = new DatabaseRoute(this.databaseService);
    this.databaseContentRoute = new DatabaseContentRoute(this.databaseService);
  }

  /**
   * Expose the module routes
   */
  registerRoutes(routeEnabling?: true | DisabledRoutes) {
    return this.serverModule.routerService.register(
      [this.databaseRoute, this.databaseContentRoute],
      routeEnabling,
      [this.databaseMiddleware.use()]
    );
  }
}
