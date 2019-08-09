import { newEngine } from "@comunica/actor-init-sparql";

/**
 * A class which executes SPARQL-queries on a TPF endpoint, which can be recorded
 */
export class QueryExecutor {

  public readonly myEngine: any; // TODO: Check why type can't be ActorInitSparql...

  constructor() {
    this.myEngine = newEngine();
  }

  public async runQuery(queryString: string, tpfSources: string[]): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const result = await this.myEngine.query(queryString, { sources: tpfSources }).then();
      await result.bindingsStream.on('data', (data: any) => {
        // do nothing
      });
      await result.bindingsStream.on('end', async () => {
        resolve();
      });
    });
  }
}
