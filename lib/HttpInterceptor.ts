import * as fs from 'fs';
import { ClientRequest, IncomingMessage } from "http";
import * as http from 'http';

// tslint:disable:no-var-requires
const crypto = require('crypto');

/**
 * A class for intercepting the HTTP-response body of a TPF-HTTP request
 */
export class HttpInterceptor {

  private readonly interceptorConfig: IInterceptorConfig;

  constructor(interceptorConfig: IInterceptorConfig) {
    this.interceptorConfig = interceptorConfig;
  }

  /* istanbul ignore next */
  public async interceptResponse(interceptOptions: IInterceptOptions): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const res: ClientRequest = http.request(interceptOptions);
      let body = '';
      res.on('response', (incoming: IncomingMessage) => {
        incoming.setEncoding('utf8');
        incoming.on('data', (chunk: any) => {
          if (typeof chunk !== 'string') {
            throw new Error(`Chunk must be of type string, not of type: ${typeof chunk}`);
          }
          body += chunk;
        });
        incoming.on('end', async () => {
          const filename = crypto.createHash('sha1')
                          .update(interceptOptions.path)
                          .digest('hex');
          this.writeToFile(body, filename, interceptOptions);
          resolve();
        });
      });
      res.end();
    });
  }

  /* istanbul ignore next */
  private writeToFile(body: string, responseFileName: string, options: IInterceptOptions): void {
    body = this.getHeaderLines(options) + body;
    fs.writeFile(`${this.interceptorConfig.directory}${responseFileName}.ttl`, body, (err: any) => {
      if (err) {
        throw new Error(`in writeToFile: could not write TPF-query results to file: ${responseFileName}`);
      }
      // else: ok
    });
  }

  /**
   * Returns a header for each query-response file so that we still have some information about it
   * @param options The options for the headers
   */
  private getHeaderLines(options: IInterceptOptions): string {
    /* istanbul ignore next line */
    return `# Query: ${options.query}
# Hashed path: ${options.path}
`;
  }

}

export interface IInterceptOptions {
  headers: any;
  method: string;
  path: string;
  port: number;
  protocol: string;
  hostname: string;
  query: string;
}

export interface IInterceptorConfig {
  defaultDirectory: boolean;
  directory: string;
}
