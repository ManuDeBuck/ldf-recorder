# ldf-recorder

[![npm version](https://badge.fury.io/js/ldf-recorder.svg)](https://www.npmjs.com/package/ldf-recorder)
[![Build status](https://github.com/comunica/ldf-recorder.js/workflows/CI/badge.svg)](https://github.com/comunica/ldf-recorder.js/actions?query=workflow%3ACI)
[![Coverage Status](https://coveralls.io/repos/github/comunica/ldf-recorder/badge.svg?branch=master)](https://coveralls.io/github/comunica/ldf-recorder?branch=master)

This is a nodejs CLI-tool for recording all HTTP- requests and responses when querying a TPF endpoint. This tool can be used to create mock-test-files for the integration-test-suite for query engines, more info can be found on the [rdf-test-suite-ldf](https://github.com/comunica/rdf-test-suite-ldf.js) repository.

## Installation

Either install it globally:

```bash
$ npm install -g ldf-recorder
```

or locally (as a dev dependency):

```bash
$ npm install ldf-recorder
```

## Usage

This CLI tool can be used to record all requests and responses when querying a TPF endpoint (by SPARQL-queries). This can be used for mocking responses when testing your TPF-query engine(s) such as the [comunica query-engines](https://github.com/comunica/comunica) based on the [comunica](https://github.com/comunica/) query engine platform.
More information on integration testing of query engines can be found in the [rdf-test-suite-ldf](https://github.com/comunica/rdf-test-suite-ldf.js) and the [engine-ontology](https://github.com/comunica/ontology-query-testing).

### Basic execution

The following command will execute the query: `SELECT * WHERE { ?s ?p <http://dbpedia.org/resource/Belgium>. ?s ?p ?o } LIMIT 5` on the TPF-endpoint: [`http://fragments.dbpedia.org/2015/en`](http://fragments.dbpedia.org/2015/en). Every separate request-response pair will be recorded and saved in a folder. TPF-recorder uses the `tests/`-folder by default.

```bash
$ ldf-recorder TPF@http://fragments.dbpedia.org/2015/en 'SELECT * WHERE { ?s ?p <http://dbpedia.org/resource/Belgium>. ?s ?p ?o } LIMIT 5'
```

#### Define sourcetype of source

To identify the different sourceTypes you will be querying it is necessary to add a `sourcetype@` before the source identifier. Examples:

```bash
TPF@http://fragments.dbpedia.org/2015-10/en
FILE@https://ruben.verborgh.org/profile/
SPARQL@http://dbpedia.org/sparql
...
```

The different identifiers that are supported are: `SPARQL`, `FILE`, `TPF`, `RDFJS`,`HDT`.

#### Choose a different output directory

All the recorded request-response files will, by default, be stored in the `tests/` folder. This output directory can be changed by adding the `-d` flag.
```bash
$ ldf-recorder TPF@http://fragments.dbpedia.org/2015/en 'SELECT * WHERE { ?s ?p <http://dbpedia.org/resource/Belgium>. ?s ?p ?o } LIMIT 5' -d path/to/folder
```

## Recorded request-response files

This CLI-tool will do two things when recording requests- and responses:

1. Store every request-response pair in a separate file.
2. Store the SPARQL-query result in a `result.srj` or `result.ttl` file, depending on the type of query (`SELECT`, `ASK`, `CONSTRUCT`).

Every request-response pair will be stored in a file without any extension. The filename of the pair is a `SHA-1` hash of the (percent decoded) request-url. That's because we want a one on one relationship between the request and the recorded file (and the request url does contain invalid and strange characters to be a filename).

Every file contains the headers: `Query`, `Hashed IRI`, `Content-type` respectively representing the `TPF`-request or `SPARQL`-query. The requested IRI which `SHA-1`'s hash the filename is, and the `Content-type` of the HTTP-response so that we are able to provide a better http mocking experience.

Example file: `ad2a977c0b37fe1520c2a74ca877a22b95b6b614`

```bash
# Query: null
# Hashed IRI: http://fragments.dbpedia.org/2015/en
# Content-type: application/trig;charset=utf-8
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>.
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>.
...
<http://commons.wikimedia.org/wiki/Special:FilePath/!!!善福寺.JPG?width=300> a dbpedia-owl:Image.
<http://commons.wikimedia.org/wiki/Special:FilePath/!!Capo32.JPG> dc11:rights <http://en.wikipedia.org/wiki/File:!!Capo32.JPG>;
    a dbpedia-owl:Image;
    foaf:thumbnail <http://commons.wikimedia.org/wiki/Special:FilePath/!!Capo32.JPG?width=300>.
<http://commons.wikimedia.org/wiki/Special:FilePath/!!Capo32.JPG?width=300> dc11:rights <http://en.wikipedia.org/wiki/File:!!Capo32.JPG>;
    a dbpedia-owl:Image.
...
```

A `result.srj`-file contains a `SPARQL-result-JSON` representation of the QUERY-result.

Example file: `result.srj`

```json
{
 "head": {
  "vars": [
   "o",
   "s",
   "p"
  ]
 },
 "results": {
  "bindings": [
   {
    "o": {
     "value": "http://dbpedia.org/resource/Belgium",
     "type": "uri"
    },
    "s": {
     "value": "http://dbpedia.org/resource/Alfa_Romeo_1900",
     "type": "uri"
    },
    "p": {
     "value": "http://dbpedia.org/ontology/assembly",
     "type": "uri"
    }
   },
   ...
  ]
 }
}
```

## Note

This CLI-tool is based on the [comunica-query platorm](https://github.com/comunica/comunica/tree/master/packages/actor-init-sparql#readme). The _request_-order (in which requests are executed and recorded) can differ from other query-engines, keep this in mind when using this tool. If support for other query-engines is needed this can be done via an issue or a pull-request. When executing a query that makes use of sources which are not `TPF`- or `SPARQL` resources only the `TPF`- or `SPARQL` request-response pairs will be recorded. Other request-response pairs will be recorded in the future.

## License

This software is written by [Manu De Buck](https://github.com/ManuDeBuck) and is released under the [MIT license](https://github.com/ManuDeBuck/ldf-recorder/blob/master/LICENSE)
