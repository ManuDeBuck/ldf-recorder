import { ActorSparqlSerializeSparqlJson } from "@comunica/actor-sparql-serialize-sparql-json";
import { Bindings } from "@comunica/bus-query-operation";
import { namedNode} from "@rdfjs/data-model";
import { Map } from "immutable";
import { IWriteConfig } from "../lib/HttpInterceptor";
import { ResultWriter } from "../lib/ResultWriter";
const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');

const binding: Bindings = Map(
  {
    '?o': namedNode('http://ex.org/oa'),
    '?s': namedNode('http://ex.org/os'),
    '?p': namedNode('http://ex.org/op'),
  });
const bindings: Bindings[] = [binding];

describe('ResultWriter', () => {

  beforeEach(() => {
    if (! fs.existsSync(writeConfig.directory)) {
      fs.mkdirSync(writeConfig.directory);
    }
  });

  const writeConfig: IWriteConfig = {
    defaultDirectory: false,
    directory: 'test/tmpfolder',
  };

  const fileExpected: string = 'test/result_tester.srj';

  describe('writeResultsToFile', () => {

    it('should return a ResultWriter', () => {

      expect(new ResultWriter(writeConfig)).toBeInstanceOf(ResultWriter);

    });

    describe('#writeResultsToFile', () => {

      it('Should write the results to result.srj', () => {

        const resultWriter: ResultWriter = new ResultWriter(writeConfig);

        resultWriter.writeResultsToFile(bindings);

        const filename: string = writeConfig.directory + '/result.srj';
        const fileContent: string = fs.readFileSync(filename, 'utf8');
        const expectedFileContent: string = fs.readFileSync(fileExpected, 'utf8');
        expect(path.extname(filename)).toEqual('.srj');
        expect(fileContent).toEqual(expectedFileContent);

      });

    });

  });

});
