import {DocsContentStyles} from '../types';
import {DatabaseService} from '../services/database.service';

export class DatabaseContentRoute {
  endpoint = '/database/content';

  errors = {
    'database/content-no-id': 'No doc id.',
  };

  constructor(private databaseService: DatabaseService) {}

  /**
   * Get doc content
   * @param query.docId - Doc file id
   * @param query.style - Doc content style
   */
  get(req: {
    query: {
      docId: string;
      style?: DocsContentStyles;
    };
  }) {
    const {docId, style} = req.query;

    if (!docId) {
      throw new Error('database/content-no-id');
    }

    return (() => {
      const content = this.databaseService.docsContent(docId, style);
      return {docId, content};
    })();
  }
}
