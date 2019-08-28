#!/usr/bin/env node
import minimist = require("minimist");
import { QueryExecutor } from "../lib/QueryExecutor";
import { ClientRequest } from "http";
import { HttpInterceptor } from "../lib/HttpInterceptor";
import { ResultWriter } from "../lib/ResultWriter";
import { Bindings } from "@comunica/bus-query-operation";
import * as fs from 'fs';
import * as Path from 'path';
import * as C from '../lib/Colors';
import { IWriteConfig, IInterceptOptions, IQueryResult } from "../lib/IRecorder";

const http = require('http');

const usageMessage = `${C.inColor(`tpf-recorder records all http-requests and responses for a specific SPARQL- or TPF- query.
tpf-recorder is based on the comunica SPARQL query engine.`,C.CYAN)}

${C.inColor('Usage: ', C.YELLOW)}:
  tpf-recorder source 'QUERY'
  tpf-recorder source1 source2 'QUERY'
  tpf-recorder source 'QUERY' -d ./path/to/folder

${C.inColor('Options: ', C.YELLOW)}
  -d    Change the directory where the outputfiles should be stored. Default directory is ./tests/`;

const args = minimist(process.argv.slice(2));

if(args._.length < 2) {
  console.error(usageMessage);
  process.exit(1);
}

// Overwrite request method to intercept the requests
const originalRequest = http.request;
http.request = function wrapRequest(options: any) : ClientRequest {
  interceptOptions.push({
    headers: options.headers,
    method: options.method || 'GET', 
    path: options.path,
    port: options.port || 80, 
    protocol: options.protocol || 'http:',
    hostname: options.hostname,
    query: options.query,
  });
  return originalRequest.apply(options, arguments);
}

// The configuration used for the interceptor
const writeConfig: IWriteConfig = {
  defaultDirectory: args.d ? true : false,
  directory: Path.join(process.cwd(), args.d ? args.d : 'tests')
}

// Check if directory exists
if(! fs.existsSync(writeConfig.directory)){
  fs.mkdirSync(writeConfig.directory);
}

// Fetch the QUERY
const query: string = args._.pop();

// Fetch the data sources given
const dataSources: string[] = [];
while(args._.length){
  dataSources.push(args._.pop());
}

// Every request's options will be stored in interceptOptions
const interceptOptions: IInterceptOptions[] = [];
const queryExecutor: QueryExecutor  = new QueryExecutor();
queryExecutor.runQuery(query, dataSources).then(async (results: IQueryResult) => {
  // undo overwriting of http.request
  http.request = originalRequest;
  // Intercept and record all requests
  const interceptor: HttpInterceptor = new HttpInterceptor(writeConfig);
  for(let interceptOption of interceptOptions){
    // For every intercepted request we should 'mock' the response
    await interceptor.interceptResponse(interceptOption);
  }
  // Write result of query in 'sparql-result-json' file
  const resultWriter: ResultWriter = new ResultWriter(writeConfig);
  resultWriter.writeResultsToFile(results);
});