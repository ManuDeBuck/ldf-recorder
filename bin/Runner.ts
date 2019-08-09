#!/usr/bin/env node
// import minimist = require("minimist");
import { QueryExecutor } from "../lib/QueryExecutor";
import { ClientRequest, IncomingMessage } from "http";
import { runInNewContext } from "vm";

const http = require('http');

// const args = minimist(process.argv.slice(2));

const originalRequest = http.request;

http.request = function wrapRequest(options: any) : ClientRequest {
  
  let res: ClientRequest = originalRequest.apply(options, arguments);

  res.on("response", async (incoming: IncomingMessage) => {
    console.log(`STATUS: ${incoming.statusCode}`);
    incoming.setEncoding('utf8');
    incoming.on('data', (chunk: string) => {
      console.log(`${chunk}`);
    });
  });

  return res;
}

new QueryExecutor().runQuery('SELECT * WHERE { ?s ?p <http://dbpedia.org/resource/Belgium>. ?s ?p ?o } LIMIT 5', 'http://fragments.dbpedia.org/2015/en');