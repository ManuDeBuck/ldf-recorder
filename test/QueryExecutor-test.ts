import { QueryExecutor } from '../lib/QueryExecutor';

jest.useFakeTimers();

describe('QueryExecutor', () => {
  const queryExecutor: QueryExecutor = new QueryExecutor();

  describe('#constructor', () => {
    it('should add a custom engine', () => {
      const qe = new QueryExecutor({});
    });
  });

  describe('#runQuery', () => {
    it('should resolve SELECT', () => {
      return expect(queryExecutor.runQuery(
        'SELECT * WHERE { ?s ?p <http://dbpedia.org/resource/Belgium>. ?s ?p ?o } LIMIT 5',
        [ 'TPF@http://fragments.dbpedia.org/2015/en' ],
        fetch,
      )).resolves.toBeTruthy();
    });

    it('should resolve ASK', () => {
      return expect(queryExecutor.runQuery(
        'ASK { ?s ?p <http://dbpedia.org/resource/Belgium>. }',
        [ 'TPF@http://fragments.dbpedia.org/2015/en' ],
        fetch,
      )).resolves.toBeTruthy();
    });

    it('should resolve CONSTRUCT', () => {
      return expect(queryExecutor.runQuery(
        'CONSTRUCT WHERE { ?s ?p ?o. } LIMIT 5',
        [ 'TPF@http://fragments.dbpedia.org/2015/en' ],
        fetch,
      )).resolves.toBeTruthy();
    });

    it('should error on undefined CLI input', () => {
      return expect(queryExecutor.runQuery(
        'CONSTRUCT WHERE { ?s ?p ?o. } LIMIT 5',
        [ 'UNKNOWN@http://fragments.dbpedia.org/2015/en' ],
        fetch,
      )).rejects.toBeTruthy();
    });

    it('should error on undefined query-type', () => {
      return expect(queryExecutor.runQuery(
        'UNKNOWN WHERE { ?s ?p ?o. } LIMIT 5',
        [ 'UNKNOWN@http://fragments.dbpedia.org/2015/en' ],
        fetch,
      )).rejects.toBeTruthy();
    });

    it('should work with prefixes', () => {
      return expect(queryExecutor.runQuery(
        `PREFIX ola: <http://ex.org>
CONSTRUCT WHERE { ?s ?p ?o. } LIMIT 5`,
        [ 'TPF@http://fragments.dbpedia.org/2015/en' ],
        fetch,
      )).resolves.toBeTruthy();
    });

    it('should work with FILE', () => {
      return expect(queryExecutor.runQuery(
        `CONSTRUCT WHERE { ?s ?p ?o. } LIMIT 5`,
        [ 'FILE@https://ruben.verborgh.org/profile/#me' ],
        fetch,
      )).resolves.toBeTruthy();
    });

    it('should work with SPARQL', () => {
      return expect(queryExecutor.runQuery(
        `SELECT * WHERE { ?s ?p <http://dbpedia.org/resource/Belgium>. ?s ?p ?o } LIMIT 5`,
        [ 'SPARQL@https://dbpedia.org/sparql' ],
        fetch,
      )).resolves.toBeTruthy();
    });
  });
});
