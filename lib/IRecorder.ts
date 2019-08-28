import { Bindings } from '@comunica/bus-query-operation';
import * as http from 'http';
import { Quad } from 'rdf-js';
import { QueryType } from './QueryExecutor';

/**
 * All the options necessary for intercepting and recording the response
 */
export interface IInterceptOptions {
  headers: any;
  method: string;
  path: string;
  port: number;
  protocol: string;
  hostname: string;
  query: string;
}

/**
 * The configuration for writing files
 */
export interface IWriteConfig {
  defaultDirectory: boolean;
  directory: string;
}

/**
 * The information concerning a mocked file
 */
export interface IMockedFile {
  body: string;
  filename: string;
  hashedIRI: string;
  headers: http.IncomingHttpHeaders;
  query: string;
}

/**
 * Interface representing the source of a query for the comunica engine
 */
export interface IQuerySource {
  type: string;
  value: string;
}

/**
 * Interface representing the result of an executed query on the Comunica engine
 */
export interface IQueryResult {
  type: QueryType;
  value: Bindings[] | boolean | Quad[];
}
