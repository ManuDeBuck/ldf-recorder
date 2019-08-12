import * as fs from 'fs';
import { ClientRequest, IncomingMessage } from "http";
import * as http from 'http';

/**
 * A class for intercepting the HTTP-response body of a TPF-HTTP request
 */
export class HttpInterceptor {

  private readonly interceptorConfig: IInterceptorConfig;

  constructor(interceptorConfig: IInterceptorConfig) {
    this.interceptorConfig = interceptorConfig;
  }

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
          await this.writeToFile(body, this.queryToHashFileName(interceptOptions.path, undefined), interceptOptions);
          resolve();
        });
      });
      res.end();
    });
  }

  private writeToFile(body: string, responseFileName: string, options: IInterceptOptions) {
    // TODO: Test if file (w/ hash) does not yet exist (maybe this can be checked even higher up)
    // TODO: Add some parameters to the beginning of file necessary for the testing
    body = this.getHeaderLines(options) + body;
    fs.writeFile(`${this.interceptorConfig.directory}${responseFileName}.ttl`, body, (err: any) => {
      if (err) {
        throw new Error(`Error in writeToFile: could not write TPF-query results to file.`);
      }
      // else: ok
    });
  }

  /**
   * Transform the querystring of the TPF query in a hash which can be used to identify the files of 
   * This function calculates a 32 bit FNV-1a hash
   * Found here: https://gist.github.com/vaiorabbit/5657561
   * Ref.: http://isthe.com/chongo/tech/comp/fnv/
   * @param queryString The specific TPF-querystring of the TPF query
   * @param seed It is possible to give a seed with the method
   */
  // TODO: Maybe use a more common hash function?
  private queryToHashFileName(queryString: string, seed: number): string {
    let i;
    let l;
    let hval = (seed === undefined) ? 0x811c9dc5 : seed;
    for (i = 0, l = queryString.length; i < l; i++) {
      hval ^= queryString.charCodeAt(i);
      hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
    }
    return ("0000000" + (hval >>> 0).toString(16)).substr(-8);
  }

  /**
   * Returns a header for each query-response file so that we still have some information about it
   * @param options The options for the headers
   */
  private getHeaderLines(options: IInterceptOptions) : string {
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
