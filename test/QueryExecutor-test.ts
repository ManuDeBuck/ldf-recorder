import * as nock from 'nock';
import { Stream } from 'stream';
import { QueryExecutor } from '../lib/QueryExecutor';

jest.useFakeTimers();

describe('QueryExecutor', () => {

  const queryExecutor: QueryExecutor = new QueryExecutor();

  describe('#runQuery', () => {

    it('should resolve SELECT', () => {

      return expect(queryExecutor.runQuery(
        'SELECT * WHERE { ?s ?p <http://dbpedia.org/resource/Belgium>. ?s ?p ?o } LIMIT 5',
        ['http://fragments.dbpedia.org/2015/en'])).resolves.toBeTruthy();

    });

    it('should resolve ASK', () => {
      return expect(queryExecutor.runQuery(
        'ASK { ?s ?p <http://dbpedia.org/resource/Belgium>. } LIMIT 5',
        ['http://fragments.dbpedia.org/2015/en'])).resolves.toBeTruthy();
    });

    it('should resolve CONSTRUCT', () => {
      return expect(queryExecutor.runQuery(
        'CONSTRUCT WHERE { ?s ?p ?o. } LIMIT 5',
        ['http://fragments.dbpedia.org/2015/en'])).resolves.toBeTruthy();
    });

  });

});
