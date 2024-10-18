import * as crypto from 'crypto';
import * as fs from 'fs';
import * as Path from 'path';
import { Readable } from 'stream';
import type { IInterceptOptions, IMockedFile, IWriteConfig } from './IRecorder';

// eslint-disable-next-line import/no-commonjs
const stringifyStream = require('stream-to-string');

/**
 * A class for intercepting and recording the HTTP-response body of a TPF-request
 */
export class HttpInterceptor {
  private readonly writeConfig: IWriteConfig;

  public constructor(writeConfig: IWriteConfig) {
    this.writeConfig = writeConfig;
  }

  /**
   * Intercept a response from a TPF endpoint and save it in files
   * @param interceptOptions
   */
  public async interceptResponse(interceptOptions: IInterceptOptions): Promise<void> {
    // Execute request
    const response = await fetch(interceptOptions.input, interceptOptions.init);

    // Determine request URL
    let requestIRI = interceptOptions.input;
    if (interceptOptions.init?.method === 'POST') {
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      requestIRI += `@@POST:${interceptOptions.init.body.toString()}`;
    }

    // Collect response body
    const body = await stringifyStream(Readable.fromWeb(<any> response.body));

    // Save response to file
    const filename = crypto.createHash('sha1')
      .update(decodeURIComponent(requestIRI))
      .digest('hex');
    const fileConfig: IMockedFile = {
      body,
      filename,
      hashedIRI: requestIRI,
      headers: response.headers,
      query: requestIRI.includes('?') ? requestIRI.slice(requestIRI.indexOf('?') + 1) : 'null',
    };
    this.writeToFile(fileConfig);
  }

  /**
   * Write all information of IMockedFile to file
   * @param config The interface of the mocked file
   */
  private writeToFile(config: IMockedFile): void {
    config.body = this.getHeaderLines(config) + config.body;
    fs.writeFile(Path.join(this.writeConfig.directory, config.filename),
      config.body,
      (err: any) => {
        if (err) {
          throw new Error(`in writeToFile: could not write TPF-query results to file: ${config.filename}`);
        }
      // Else: ok
      });
  }

  /**
   * Returns a header for each query-response file so that we still have some information about it
   * @param options The options for the headers
   */
  private getHeaderLines(config: IMockedFile): string {
    return `# Query: ${config.query}
# Hashed IRI: ${config.hashedIRI}
# Content-type: ${config.headers.get('content-type')}
`;
  }
}
