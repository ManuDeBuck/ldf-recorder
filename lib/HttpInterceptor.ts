import * as fs from 'fs';
import { ClientRequest, IncomingMessage } from "http";
import * as http from 'http';

// tslint:disable:no-var-requires
const crypto = require('crypto');
// tslint:enabe:no-var-requires

/**
 * A class for intercepting and recording the HTTP-response body of a TPF-request
 */
export class HttpInterceptor {

  private readonly interceptorConfig: IWriteConfig;

  constructor(interceptorConfig: IWriteConfig) {
    this.interceptorConfig = interceptorConfig;
  }

  /**
   * Intercept a response from a TPF endpoint and save it in files
   * @param interceptOptions 
   */
  public async interceptResponse(interceptOptions: IInterceptOptions): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const res: ClientRequest = http.request(interceptOptions);
      let body = '';
      res.on('response', (incoming: IncomingMessage) => {
        incoming.setEncoding('utf8');
        const headers: http.IncomingHttpHeaders = incoming.headers;
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
    fs.writeFile(`${this.interceptorConfig.directory}${config.filename}${this.getExtension(config)}`,
    config.body, (err: any) => {
      if (err) {
        throw new Error(`in writeToFile: could not write TPF-query results to file: ${config.filename}`);
      }
      // else: ok
    });
  }

  /**
   * Return the extension for the mocked file based on the content-type header
   * @param config The interface of the mocked file
   */
  private getExtension(config: IMockedFile): string {
    switch (config.headers["content-type"]) {
    case "application/trig;charset=utf-8":
      return ".ttl";
    case "application/sparql-results+json":
      return "srj";
    default:
      return ".ttl";
    }
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
