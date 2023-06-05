import * as fs from 'fs';
import * as Path from 'path';
import { BindingsFactory } from '@comunica/bindings-factory';
import type * as RDF from '@rdfjs/types';
import * as fse from 'fs-extra';
import type { Quad } from 'n3';
import { DataFactory } from 'n3';
import type { IWriteConfig } from '../lib/IRecorder';
import { QueryType } from '../lib/QueryExecutor';
import { ResultWriter } from '../lib/ResultWriter';

const BF = new BindingsFactory();

const { namedNode, literal, defaultGraph, quad } = DataFactory;

const binding: RDF.Bindings = BF.fromRecord({
  o: namedNode('http://ex.org/oa'),
  s: namedNode('http://ex.org/os'),
  p: namedNode('http://ex.org/op'),
});
const bindings: RDF.Bindings[] = [ binding ];

const bool = false;

const myQuad: Quad = quad(
  namedNode('https://m.org/#'),
  namedNode('https://e.org/p'),
  literal('A', 'en'),
  defaultGraph(),
);
const quads: Quad[] = [ myQuad ];

describe('ResultWriter', () => {
  beforeEach(() => {
    if (!fs.existsSync(writeConfig.directory)) {
      fs.mkdirSync(writeConfig.directory);
    }
  });

  const writeConfig: IWriteConfig = {
    defaultDirectory: false,
    directory: Path.join(process.cwd(), 'test', 'tmpfolder'),
  };

  const fileExpected: string = Path.join(process.cwd(), 'test', 'result_expected.srj');

  describe('#writeResultsToFile', () => {
    it('should return a ResultWriter', () => {
      expect(new ResultWriter(writeConfig)).toBeInstanceOf(ResultWriter);
    });

    it('Should write the results of a binding', async() => {
      const resultWriter: ResultWriter = new ResultWriter(writeConfig);

      await resultWriter.writeResultsToFile({
        type: QueryType.SELECT,
        value: bindings,
        variables: [ 'o', 's', 'p' ],
      });

      const filename: string = Path.join(writeConfig.directory, 'result.srj');
      const fileContent: string = fs.readFileSync(filename, 'utf8');
      const expectedFileContent: string = fs.readFileSync(fileExpected, 'utf8');
      expect(Path.extname(filename)).toEqual('.srj');
      expect(fileContent).toEqual(expectedFileContent);
      fse.removeSync(Path.join(writeConfig.directory, 'result.srj'));
    });

    it('Should write the results of a boolean', async() => {
      const resultWriter: ResultWriter = new ResultWriter(writeConfig);

      await resultWriter.writeResultsToFile({ type: QueryType.ASK, value: bool });

      const filename: string = Path.join(writeConfig.directory, 'result.srj');
      const fileContent: string = fs.readFileSync(filename, 'utf8');
      expect(Path.extname(filename)).toEqual('.srj');
      expect(fileContent).toEqual(`{"head":{},"boolean":false}`);
      fse.removeSync(Path.join(writeConfig.directory, 'result.srj'));
    });

    it('Should write the results of a quad', async() => {
      const resultWriter: ResultWriter = new ResultWriter(writeConfig);

      await resultWriter.writeResultsToFile({ type: QueryType.CONSTRUCT, value: quads });

      const filename: string = Path.join(writeConfig.directory, 'result.ttl');
      const fileContent: string = fs.readFileSync(filename, 'utf8');
      expect(Path.extname(filename)).toEqual('.ttl');
      expect(fileContent.trim()).toEqual(`<https://m.org/#> <https://e.org/p> "A"@en.`);
      fse.removeSync(Path.join(writeConfig.directory, 'result.ttl'));
    });
  });
});
