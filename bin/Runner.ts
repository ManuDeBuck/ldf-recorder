#!/usr/bin/env node
// import minimist = require("minimist");
import { QueryExecutor } from "../lib/QueryExecutor";
import { ClientRequest, IncomingMessage } from "http";
import { runInNewContext } from "vm";
import { join } from "path";
import { Readable } from "stream";
import { Socket } from "net";
import { AssertionError } from "assert";
import { HttpInterceptor } from "../lib/HttpInterceptor";

const http = require('http');

// const args = minimist(process.argv.slice(2));

const originalRequest = http.request;

export interface RequestOption {
  headers: Object;
  method: string;
  path: string;
  port: number;
  protocol: string;
  hostname: string;
}

const requestOptions : any[] = [];

http.request = function wrapRequest(options: any) : ClientRequest {
  requestOptions.push({
    headers: options.headers,
    method: options.method, 
    path: options.path,
    port: options.port, 
    protocol: options.protocol,
    hostname: options.hostname
  });
  // requestOptions.push(options);
  return originalRequest.apply(options, arguments);
}

async function intercept() : Promise<void> {
  const v = new QueryExecutor();
  v.runQuery('SELECT * WHERE { ?s ?p <http://dbpedia.org/resource/Belgium>. ?s ?p ?o } LIMIT 5', 'http://fragments.dbpedia.org/2015/en').then(() => {
    http.request = originalRequest;
    new HttpInterceptor(requestOptions[0]).interceptResponse().then(() => {
      console.log("succes!")
    });
  });
}

intercept(); 