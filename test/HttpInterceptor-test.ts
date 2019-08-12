import { HttpInterceptor } from '../lib/HttpInterceptor';

const nock = require('nock');
const fs = require('fs');
const fse = require('fs-extra');
const crypto = require('crypto');

describe('HttpInterceptor', () => {

  beforeEach(() => {
    if (! fs.existsSync(jestTestFolder)) {
      fs.mkdirSync(jestTestFolder);
    }
  });

  const jestTestFolder: string = 'test/tmpfolder/';

  const interceptor: HttpInterceptor = new HttpInterceptor({
    defaultDirectory: true, directory: jestTestFolder });

  describe('#interceptResponse', () => {

    nock('http://ex.org').get('/path/').reply(200,
`@prefix : <http://ex.org/ex#>
:_ a :test`);

    it('Should have created a new file with a hash and content', () => {
      interceptor.interceptResponse({
        headers: "", method: "GET", path: "/path/", port: undefined, protocol: "http:", hostname: "ex.org", query: "",
      }).then(() => {
        fs.readdir(jestTestFolder, (error, files) => {
          const amount: number = files.length;
          const filename: string = crypto.createHash('sha1')
                          .update('/path/')
                          .digest('hex') + '.ttl';
          const fileContent: string = fs.readFileSync(jestTestFolder + filename, 'utf8');
          expect(files[0]).toEqual(filename);
          expect(amount > 0).toBeTruthy();
          expect(fileContent.startsWith(`# Query: ${""}
# Hashed path: ${"/path/"}`)).toBeTruthy();
          fse.removeSync(jestTestFolder);
        });
      });
    });

  });

});
