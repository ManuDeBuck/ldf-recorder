import { ClientRequest, IncomingMessage } from "http";
import { RequestOption } from "../bin/Runner";

const http = require('http');
const fs = require('fs');

/**
 * A class for intercepting a HTTP-request and response.
 */
export class HttpInterceptor {

  private requestOption: any;

  constructor(requestOption: any){
    this.requestOption = requestOption;
  }

  public async interceptResponse() : Promise<void> {
    return new Promise(async (resolve, reject) => {
      let res: ClientRequest = http.request(this.requestOption);
      let body = '';
      res.on('response', (incoming: IncomingMessage) => {
        incoming.setEncoding('utf8');
        incoming.on('data', (chunk: any) => {
          if(typeof chunk !== 'string')
            throw new Error(`Chunk must be of type string, not of type: ${typeof chunk}`);
          body += chunk;
        });
        incoming.on('end', () => {
          fs.writeFile("test.txt", body, (err: Error) => {});
          resolve();
        });
      });
      res.end();
    });
  }

}