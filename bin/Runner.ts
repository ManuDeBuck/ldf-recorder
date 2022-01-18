#!/usr/bin/env node
/* eslint-disable no-sync,unicorn/filename-case */
import * as fs from 'fs';
import * as Path from 'path';
import minimist = require('minimist');
import * as C from '../lib/Colors';
import { HttpInterceptor } from '../lib/HttpInterceptor';
import type { IWriteConfig, IInterceptOptions, IQueryResult } from '../lib/IRecorder';
import { QueryExecutor } from '../lib/QueryExecutor';
import { ResultWriter } from '../lib/ResultWriter';

const usageMessage = `${C.inColor(`ldf-recorder records all http-requests and responses for a specific SPARQL- or TPF- query.
ldf-recorder is based on the comunica SPARQL query engine.`, C.CYAN)}

${C.inColor('Usage: ', C.YELLOW)}:
  ldf-recorder type@source [type@source2 [type@source3] 'QUERY' [-d ./path/to/folder]
  ldf-recorder TPF@http://fragments.dbpedia.org/2016-04/en 'SELECT * WHERE { ?s ?p ?o } LIMIT 100'

${C.inColor('Options: ', C.YELLOW)}
  -d    Change the directory where the outputfiles should be stored. Default directory is ./tests/`;

const args = minimist(process.argv.slice(2));

if (args._.length < 2) {
  // eslint-disable-next-line no-console
  console.error(usageMessage);
  process.exit(1);
}

// Overwrite request method to intercept the requests
function wrapFetch(originalFetch: typeof fetch): typeof fetch {
  return (input, init) => {
    if (typeof input !== 'string') {
      throw new Error(`Unsupported non-string fetch input: ${JSON.stringify(input)}`);
    }
    interceptOptions.push({ input, init });
    return originalFetch(input, init);
  };
}

// The configuration used for the interceptor
const writeConfig: IWriteConfig = {
  defaultDirectory: !!args.d,
  directory: Path.join(process.cwd(), args.d ? args.d : 'tests'),
};

// Check if directory exists
if (!fs.existsSync(writeConfig.directory)) {
  fs.mkdirSync(writeConfig.directory);
}

// Fetch the QUERY
const query: string = args._.pop();

// Fetch the data sources given
const dataSources: string[] = [];
while (args._.length) {
  dataSources.push(args._.pop());
}

// Every request's options will be stored in interceptOptions
const interceptOptions: IInterceptOptions[] = [];
const queryExecutor: QueryExecutor = new QueryExecutor();
queryExecutor.runQuery(query, dataSources, wrapFetch(fetch)).then(async(results: IQueryResult) => {
  // Intercept and record all requests
  const interceptor: HttpInterceptor = new HttpInterceptor(writeConfig);
  for (const interceptOption of interceptOptions) {
    // For every intercepted request we should 'mock' the response
    await interceptor.interceptResponse(interceptOption);
  }
  // Write result of query in 'sparql-result-json' file
  const resultWriter: ResultWriter = new ResultWriter(writeConfig);
  await resultWriter.writeResultsToFile(results);
})
  // eslint-disable-next-line no-console
  .catch(error => console.error(error));
