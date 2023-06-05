/* eslint-disable import/group-exports */
import type * as RDF from 'rdf-js';
import type { QueryType } from './QueryExecutor';

/**
 * All the options necessary for intercepting and recording the response
 */
export interface IInterceptOptions {
  input: string;
  init?: RequestInit;
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
  query: string;
  body: string;
  filename: string;
  hashedIRI: string;
  headers: Headers;
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
  value: RDF.Bindings[] | boolean | RDF.Quad[];
  variables?: string[];
}

/* eslint-enable import/group-exports */
