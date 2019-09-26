import * as crypto from 'crypto';
import * as fs from 'fs';
import { ClientRequest, IncomingMessage } from "http";
import * as http from 'http';
import * as https from 'https';
import * as Path from 'path';
import { IInterceptOptions, IMockedFile, IWriteConfig } from './IRecorder';

/**
 * A class for intercepting and recording the HTTP-response body of a TPF-request
 */
export class HttpInterceptor {

  private readonly writeConfig: IWriteConfig;

  constructor(writeConfig: IWriteConfig) {
    this.writeConfig = writeConfig;
  }

  /**
   * Intercept a response from a TPF endpoint and save it in files
   * @param interceptOptions
   */
  public async interceptResponse(interceptOptions: IInterceptOptions): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const res: ClientRequest = (interceptOptions.protocol === 'http:' ? http : https).request(interceptOptions);
      let body = '';
      res.on('error', reject);
      res.on('response', (incoming: IncomingMessage) => {
        incoming.setEncoding('utf8');
        const headers = incoming.headers;
        incoming.on('error', reject);
        incoming.on('data', (chunk: any) => {
          if (typeof chunk !== 'string') {
            throw new Error(`Chunk must be of type string, not of type: ${typeof chunk}`);
          }
          body += chunk;
        });
        incoming.on('end', async () => {
          // Decode to get the pure URI
          const requestIRI = decodeURIComponent(interceptOptions.protocol + '//' +
                                                interceptOptions.hostname + interceptOptions.path);
          const filename = crypto.createHash('sha1')
                          .update(requestIRI)
                          .digest('hex');
          const fileConfig: IMockedFile = {
            body,
            filename,
            hashedIRI: requestIRI,
            headers,
            query: interceptOptions.query,
          };
          this.writeToFile(fileConfig);
          resolve();
        });
      });
      res.end();
    });
  }

  /**
   * Write all information of IMockedFile to file
   * @param config The interface of the mocked file
   */
  private writeToFile(config: IMockedFile): void {
    config.body = this.getHeaderLines(config) + config.body;
    fs.writeFile(Path.join(this.writeConfig.directory, config.filename),
    config.body, (err: any) => {
      if (err) {
        throw new Error(`in writeToFile: could not write TPF-query results to file: ${config.filename}`);
      }
      // else: ok
    });
  }

  /**
   * Returns a header for each query-response file so that we still have some information about it
   * @param options The options for the headers
   */
  private getHeaderLines(config: IMockedFile): string {
    return `# Query: ${config.query}
# Hashed IRI: ${config.hashedIRI}
# Content-type: ${config.headers["content-type"]}
`;
  }

}
