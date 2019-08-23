import { newEngine } from "@comunica/actor-init-sparql";
import { Bindings } from "@comunica/bus-query-operation";
import { Quad } from "rdf-js";

/**
 * A class which executes SPARQL-queries on a TPF endpoint that can be recorded
 */
export class QueryExecutor {

  public readonly myEngine: any;

  constructor() {
    this.myEngine = newEngine();
  }

  /**
   * Run the SPARQL query over the sources and return the result (as Bindings) so that
   * it can be recorded and saved too
   * @param queryString The SPARQL-query string
   * @param tpfSources A list of remote TPF endpoints
   */
  public async runQuery(queryString: string, tpfSources: string[]): Promise<IQueryResult> {
    const queryType: QueryType = this.getQueryType(queryString);
    return new Promise(async (resolve, reject) => {
      switch (queryType) {
      case QueryType.SELECT:
        const rss: Bindings[] = [];
        const rs = await this.myEngine.query(queryString, { sources: tpfSources });
        await rs.bindingsStream.on('data', (data: Bindings) => {
          rss.push(data);
        });
        await rs.bindingsStream.on('end', async () => {
          resolve({type: QueryType.SELECT, value: rss});
        });
        break;
      case QueryType.ASK:
        const ra = await this.myEngine.query(queryString, { sources: tpfSources });
        resolve({type: QueryType.ASK, value: await ra.booleanResult});
        break;
      case QueryType.CONSTRUCT:
        const rsc: Quad[] = [];
        const rc = await this.myEngine.query(queryString, { sources: tpfSources });
        await rc.quadStream.on('data', (data: Quad) => {
          rsc.push(data);
        });
        await rc.quadStream.on('end', async () => {
          resolve({type: QueryType.CONSTRUCT, value: rsc});
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
    switch (queryString.split(' ')[0]) {
    case 'ASK':
      return QueryType.ASK;
    case 'SELECT':
      return QueryType.SELECT;
    case 'CONSTRUCT':
      return QueryType.CONSTRUCT;
    }
  }
}

/**
 * Interface representing the result of an executed query on the Comunica engine
 */
export interface IQueryResult {
  type: QueryType;
  value: Bindings[] | boolean | Quad[];
}

/**
 * The different QueryTypes the comunica engine and the recorder support
 */
export enum QueryType {
  ASK,
  SELECT,
  CONSTRUCT,
}
