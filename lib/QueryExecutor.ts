import { newEngine, ActorInitSparql } from "@comunica/actor-init-sparql";

/**
 * A class which executes SPARQL-queries on a TPF endpoint.
 */
export class QueryExecutor {

  public readonly myEngine: any; // TODO: Check why type can't be ActorInitSparql...
 
  constructor(){
    this.myEngine = newEngine();
  }

  public async runQuery(queryString: string, tpfSourceIRI: string) : Promise<void> {
    const result = await this.myEngine.query(queryString, { sources: [tpfSourceIRI] });
    result.bindingsStream.on('data', (data: any) => console.log(data.toObject()));
  }

}