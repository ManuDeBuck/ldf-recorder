import { Util } from '../lib/Util';

jest.useFakeTimers();

describe('Util', () => {

  const input1: string = '/path/is/ok/';
  const input2: string = '/path/is/not/ok';

  describe('#makePath', () => {
    it('Should leave the path as is', () => {
      expect(Util.makePath(input1)).toEqual(input1);
    });
    it('Should add a trailing slash to the path', () => {
      expect(Util.makePath(input2)).toEqual(input2 + '/');
    });
  });

});
