import { Bindings } from "@comunica/bus-query-operation";
import { IWriteConfig } from "./HttpInterceptor";
// tslint:disable:no-var-requires
const fs = require('fs');
import * as RDF from "rdf-js";

export class ResultWriter {

  private writeConfig: IWriteConfig;

  constructor(writeConfig: IWriteConfig) {
    this.writeConfig = writeConfig;
  }

  public writeResultsToFile(results: Bindings[]): void {
    fs.writeFile(`${this.writeConfig.directory}/result.srj`, this.bindingsToSparqlJsonResult(results), (err: any) => {
      if (err) {
        throw new Error(`in writeResultsToFile: could not write TPF-query result to file: result.srj`);
      }
      // else: ok
    });
  }

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
        bres[key.substr(1)] = this.bindingToJsonBindings(value);
      });
      results.bindings.push(bres);
    }

    return JSON.stringify({head, results}, null, 1);
  }

  /**
   * Converts an RDF term to its JSON representation.
   * @param {RDF.Term} value An RDF term.
   * @return {any} A JSON object.
   */
  private bindingToJsonBindings(value: RDF.Term): any {
    if (value.termType === 'Literal') {
      const literal: RDF.Literal = <RDF.Literal> value;
      const jsonValue: any = { value: literal.value, type: 'literal' };
      const language: string = literal.language;
      const datatype: RDF.NamedNode = literal.datatype;
      if (language) {
        jsonValue['xml:lang'] = language;
      } else if (datatype && datatype.value !== 'http://www.w3.org/2001/XMLSchema#string') {
        jsonValue.datatype = datatype.value;
      }
      return jsonValue;
    } else if (value.termType === 'BlankNode') {
      return { value: value.value, type: 'bnode' };
    } else {
      return { value: value.value, type: 'uri' };
    }
  }

}
