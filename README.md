# tpf-recorder
This is a nodejs CLI-tool for recording all HTTP- requests and responses when querying a TPF endpoint. (note: SPARQL-endpoint recording is coming soon). This tool can be used to create mock-test-files for the integration-test-suite for query engines: [rdf-test-suite-ldf](https://github.com/comunica/rdf-test-suite-ldf.js)

## Installation

Either install it globally:

```bash
$ command coming soon
```

or locally (as a dev dependency):

```bash
$ command coming soon
```

## Usage

This CLI tool can be used to record all requests and responses when querying a TPF endpoint (by SPARQL-queries). This can be used for mocking responses when testing your TPF-query engine(s) such as the [comunica query-engines](https://github.com/comunica/comunica) based on the [comunica](https://github.com/comunica/) query engine platform. 
More information on integration testing of query engines can be found in the [rdf-test-suite-ldf](https://github.com/comunica/rdf-test-suite-ldf.js) and the [engine-ontology](https://github.com/comunica/ontology-query-testing).

### Basic execution

The following command will execute the query: `SELECT * WHERE { ?s ?p <http://dbpedia.org/resource/Belgium>. ?s ?p ?o } LIMIT 5` on the TPF-endpoint: [`http://fragments.dbpedia.org/2015/en`](http://fragments.dbpedia.org/2015/en). Every separate request-response pair will be recorded and saved in a folder. TPF-recorder uses the `tests/`-folder by default.

```bash
$ tpf-recorder http://fragments.dbpedia.org/2015/en 'SELECT * WHERE { ?s ?p <http://dbpedia.org/resource/Belgium>. ?s ?p ?o } LIMIT 5'
```

#### Choose a different output directory

All the recorded request-response files will, by default, be stored in the `tests/` folder. This output directory can be changed by adding the `-d` flag. 
```bash
$ tpf-recorder http://fragments.dbpedia.org/2015/en 'SELECT * WHERE { ?s ?p <http://dbpedia.org/resource/Belgium>. ?s ?p ?o } LIMIT 5' -d path/to/folder
```

## Recorded request-response files

This CLI-tool will do two things when recording requests- and responses:
 
1. Store every request-response pair in a separate file
2. Store the SPARQL-query result in a `result.srj` file

Every request-response pair will be stored in a file with an extension according to the response's `Content-Type`. The filename of the pair is a  `SHA-1` hash of the request-url. That's because we want a one on one relationship between the request and the recorded file (and the request url does contain invalid characters). 

Every file contains the headers: `Query`, `Hashed IRI`, `Content-type` respectively representing the `TPF-Query` (subject, predicate, object) The requested IRI which `SHA-1`'s hash the filename is named after. And the `Content-type` of the HTTP-response.

Example file: `ad2a977c0b37fe1520c2a74ca877a22b95b6b614.ttl`

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

This CLI-tool is based on the [comunica-query platorm](https://github.com/comunica/comunica/tree/master/packages/actor-init-sparql#readme). The _request_-order (in which requests are executed and recorded) can differ from other query-engines, keep this in mind when using this tool. If support for other query-engines is needed this can be done via an issue or a pull-request.

## License

This software is written by [Manu De Buck](https://github.com/ManuDeBuck) and is released under the [MIT license](https://github.com/ManuDeBuck/tpf-recorder/blob/master/LICENSE)