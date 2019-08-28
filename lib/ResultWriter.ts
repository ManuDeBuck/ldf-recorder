import { ActorSparqlSerializeSparqlJson } from "@comunica/actor-sparql-serialize-sparql-json";
import { Bindings } from "@comunica/bus-query-operation";
import * as fs from 'fs';
import { Quad, Writer } from "n3";
import * as Path from 'path';
import * as RDF from "rdf-js";
import { IQueryResult, IWriteConfig } from "./IRecorder";
import { QueryType } from "./QueryExecutor";

export class ResultWriter {

  private writeConfig: IWriteConfig;

  constructor(writeConfig: IWriteConfig) {
    this.writeConfig = writeConfig;
  }

  /**
   * Write the QUERY-results to a .srj file
   * @param results The bindings returned from the query-engine
   */
  public writeResultsToFile(results: IQueryResult): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.writeFile(Path.join(this.writeConfig.directory, `result${this.getResultExtension(results.type)}`),
        this.getResultString(results), (err: any) => {
          if (err) {
            throw new Error(`in writeResultsToFile: could not write TPF-query result to file: result.srj`);
          }
          resolve();
        // else: ok
        });
    });
  }

  /**
   * Returns the extension of the result file, depening on the QueryType
   * @param type The type of the query
   */
  private getResultExtension(type: QueryType) {
    switch (type) {
    case QueryType.ASK:
      return '.srj';
    case QueryType.CONSTRUCT:
      return '.ttl';
    case QueryType.SELECT:
      return '.srj';
    }
  }

  /**
   * Return the string representing the result, depending on the QueryType
   * @param results The IQueryResult
   */
  private getResultString(results: IQueryResult): string {
    switch (results.type) {
    case QueryType.SELECT:
      return this.bindingsToSparqlJsonResult(<Bindings[]> results.value);
    case QueryType.ASK:
      return this.booleanToSparqlJsonResult(<boolean> results.value);
    case QueryType.CONSTRUCT:
      return this.quadsToTurtle(<Quad[]> results.value);
    }
  }

  /**
   * Transform the quads in turtle format used for testing
   * @param quads The quads representing the result of the query
   */
  private quadsToTurtle(quads: Quad[]): string {
    const writer = new Writer();
    for (const quad of quads) {
      writer.addQuad(quad);
    }
    let res: string;
    writer.end((error, result: string) => {
      res = result;
    });
    return res;
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

  /**
   * Transform the boolean to the SPARQLJonResult format used for testing
   * @param boolean The boolean returned from the query-engine
   */
  private booleanToSparqlJsonResult(ask: boolean): string {
    return JSON.stringify({head: {}, boolean: ask});
  }

}
