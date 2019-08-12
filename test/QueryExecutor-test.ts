import { QueryExecutor } from '../lib/QueryExecutor';

jest.useFakeTimers();

describe('QueryExecutor', () => {

  const queryExecutor: QueryExecutor = new QueryExecutor();

  describe('#runQuery', () => {

    it('Should resolve', () => {
      expect(queryExecutor.runQuery(
        'SELECT * WHERE { ?s ?p <http://dbpedia.org/resource/Belgium>. ?s ?p ?o } LIMIT 5',
        ['http://fragments.dbpedia.org/2015/en'])).resolves;
    });

  });

});
