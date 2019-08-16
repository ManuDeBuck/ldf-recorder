import { HttpInterceptor } from '../lib/HttpInterceptor';

const nock = require('nock');
const fs = require('fs');
const fse = require('fs-extra');
const crypto = require('crypto');
const path = require('path');

describe('HttpInterceptor', () => {

  beforeEach(() => {
    if (! fs.existsSync(jestTestFolder)) {
      fs.mkdirSync(jestTestFolder);
    }
  });

  const jestTestFolder: string = path.join('test', 'tmpfolder', '/');

  const interceptor: HttpInterceptor = new HttpInterceptor({
    defaultDirectory: true, directory: jestTestFolder });

  describe('#interceptResponse', () => {

    const ct: string = 'application/trig;charset=utf-8';
    const fn: string = 'http://ex.org/path/';

    it('should have created a new file with a hash and content', () => {

      nock('http://ex.org')
      .defaultReplyHeaders({
        'Content-Type': ct,
      }).get('/path/').reply(200,
`@prefix : <http://ex.org/ex#>
:_ a :test`);

      interceptor.interceptResponse({
        headers: "", method: "GET", path: "/path/", port: undefined, protocol: "http:", hostname: "ex.org", query: "",
      }).then(() => {
        fs.readdir(jestTestFolder, (error, files) => {
          const amount: number = files.length;
          const filename: string = crypto.createHash('sha1')
                          .update(fn)
                          .digest('hex') + '.ttl';
          const fileContent: string = fs.readFileSync(path.join(jestTestFolder, filename), 'utf8');
          expect(fileContent.startsWith(`# Query: ${""}
# Hashed IRI: ${fn}
# Content-type: ${ct}`)).toBeTruthy();
        });
      });
    });

    it('should resolve', () => {

      nock('http://ex.org')
      .defaultReplyHeaders({
        'Content-Type': ct,
      }).get('/path/').reply(200,
`@prefix : <http://ex.org/ex#>
:_ a :test`);

      return expect(interceptor.interceptResponse({
        headers: "", method: "GET", path: "/path/", port: undefined, protocol: "http:", hostname: "ex.org", query: "",
      })).resolves.toBeUndefined();

    });

    it('should resolve when content-type is undefined', () => {

      nock('http://ex.org')
      .get('/path/').reply(200,
`@prefix : <http://ex.org/ex#>
:_ a :test`);

      return expect(interceptor.interceptResponse({
        headers: "", method: "GET", path: "/path/", port: undefined, protocol: "http:", hostname: "ex.org", query: "",
      })).resolves.toBeUndefined();

    });

  });

  afterEach(() => {
    if (! fs.existsSync(jestTestFolder)) {
      fse.removeSync(jestTestFolder);
    }
  });

});
