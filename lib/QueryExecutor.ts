/* eslint-disable no-case-declarations */
import { QueryEngine } from '@comunica/query-sparql';
import type { IQueryBindingsEnhanced } from '@comunica/types';
import type * as RDF from 'rdf-js';
import type { IQueryResult, IQuerySource } from './IRecorder';

/**
 * A class which executes SPARQL-queries on a TPF endpoint that can be recorded
 */
// eslint-disable-next-line import/group-exports
export class QueryExecutor {
  public readonly myEngine: QueryEngine;

  public constructor(engine?: any) {
    // Use comunica engine by default.
    this.myEngine = engine || new QueryEngine();
  }

  /**
   * Run the SPARQL query over the sources and return the result (as Bindings) so that
   * it can be recorded and saved too
   * @param queryString The SPARQL-query string
   * @param tpfSources A list of remote TPF endpoints
   * @param fetcher The fetch function to use.
   */
  public async runQuery(queryString: string, tpfSources: string[], fetcher: typeof fetch): Promise<IQueryResult> {
    const queryType: QueryType = this.getQueryType(queryString);
    const querySources: IQuerySource[] = this.mapSources(tpfSources);
    const context = { sources: querySources, fetch: fetcher };
    return new Promise(async(resolve, reject) => {
      switch (queryType) {
        case QueryType.SELECT:
          const rss: RDF.Bindings[] = [];
          const rs = <IQueryBindingsEnhanced> await this.myEngine.query(queryString, <any>context);
          const metadata = await rs.metadata();
          const bindingsStream = await rs.execute();
          bindingsStream.on('data', (data: RDF.Bindings) => {
            rss.push(data);
          });
          bindingsStream.on('error', reject);
          bindingsStream.on('end', () => {
            resolve({ type: QueryType.SELECT, value: rss, variables: metadata.variables.map(vr => vr.value) });
          });
          break;
        case QueryType.ASK:
          const booleanResult = await this.myEngine.queryBoolean(queryString, <any>context);
          resolve({ type: QueryType.ASK, value: booleanResult });
          break;
        case QueryType.CONSTRUCT:
          const rsc: RDF.Quad[] = [];
          const quadStream = await this.myEngine.queryQuads(queryString, <any>context);
          quadStream.on('data', (data: RDF.Quad) => {
            rsc.push(data);
          });
          quadStream.on('error', reject);
          quadStream.on('end', async() => {
            resolve({ type: QueryType.CONSTRUCT, value: rsc });
          });
          break;
      }
    });
  }

  /**
   * Returns an ENUM representing the QueryType of the querystring
   * @param queryString The query
   */
  private getQueryType(queryString: string): QueryType {
    let content = queryString.split('\n');
    let fln = content[0];
    while (fln.startsWith('PREFIX') || fln.startsWith('prefix') || fln.trim() === '') {
      content = content.slice(1);
      fln = content[0];
    }
    queryString = content.join('\n');
    switch (queryString.split(' ')[0]) {
      case 'ASK':
        return QueryType.ASK;
      case 'SELECT':
        return QueryType.SELECT;
      case 'CONSTRUCT':
        return QueryType.CONSTRUCT;
      default:
        throw new Error(`The query-type: ${queryString.split(' ')[0]} is unknown or not yet supported`);
    }
  }

  /**
   * Map the sources from the command line interface into IQuerySources used by the query engine
   * @param sources The sources on the command line
   */
  private mapSources(sources: string[]): IQuerySource[] {
    const res = [];
    for (const source of sources) {
      let type = source.split('@')[0];
      const value = source.split('@')[1];
      switch (type) {
        case 'FILE':
          type = 'file';
          break;
        case 'TPF':
          type = '';
          break;
        case 'SPARQL':
          type = 'sparql';
          break;
        default:
          throw new Error(`unsupported sourceType: ${type}`);
      }
      res.push({ type, value });
    }
    return res;
  }
}

/**
 * The different QueryTypes the comunica engine and the recorder support
 */
// eslint-disable-next-line import/group-exports
export enum QueryType {
  ASK,
  SELECT,
  CONSTRUCT,
}
/* eslint-enable no-case-declarations */
