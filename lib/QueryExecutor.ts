import { newEngine } from "@comunica/actor-init-sparql";
import { Bindings } from "@comunica/bus-query-operation";

/**
 * A class which executes SPARQL-queries on a TPF endpoint, which can be recorded
 */
export class QueryExecutor {

  public readonly myEngine: any; // TODO: Check why type can't be ActorInitSparql...

  constructor() {
    this.myEngine = newEngine();
  }

  public async runQuery(queryString: string, tpfSources: string[]): Promise<Bindings[]> {
    return new Promise(async (resolve, reject) => {
      const results: Bindings[] = [];
      const result = await this.myEngine.query(queryString, { sources: tpfSources });
      await result.bindingsStream.on('data', (data: Bindings) => {
        results.push(data);
      });
      await result.bindingsStream.on('end', async () => {
        resolve(results);
      });
    });
  }
}
