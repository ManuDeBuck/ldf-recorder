import { ActorSparqlSerializeSparqlJson } from "@comunica/actor-sparql-serialize-sparql-json";
import { Bindings } from "@comunica/bus-query-operation";
import * as fs from 'fs';
import * as Path from 'path';
import * as RDF from "rdf-js";
import { IWriteConfig } from "./HttpInterceptor";

export class ResultWriter {

  private writeConfig: IWriteConfig;

  constructor(writeConfig: IWriteConfig) {
    this.writeConfig = writeConfig;
  }

  /**
   * Write the QUERY-results to a .srj file
   * @param results The bindings returned from the query-engine
   */
  public writeResultsToFile(results: Bindings[]): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.writeFile(Path.join(this.writeConfig.directory, 'result.srj'),
        this.bindingsToSparqlJsonResult(results), (err: any) => {
          if (err) {
            throw new Error(`in writeResultsToFile: could not write TPF-query result to file: result.srj`);
          }
          resolve();
        // else: ok
        });
    });
  }

  /**
   * Transform the bindings to the SPARQLJsonResult format used for testing
   * @param bindings The bindings returned from the query-engine
   */
  private bindingsToSparqlJsonResult(bindings: Bindings[]): string {
    const head: any = {};
    head.vars = [];
    if (bindings.length && bindings[0].size) {
      bindings[0].keySeq().forEach((key) => head.vars.push(key.substr(1)));
    }

    const results: any = {};
    results.bindings = [];
    for (const binding of bindings) {
      const bres: any = {};
      binding.keySeq().forEach((key: string) => {
        const value: RDF.Term = binding.get(key);
        bres[key.substr(1)] = ActorSparqlSerializeSparqlJson.bindingToJsonBindings(value);
      });
      results.bindings.push(bres);
    }

    return JSON.stringify({head, results}, null, 1);
  }

}
