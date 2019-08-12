/**
 * A class with utility functions
 */
export class Util {

  /**
   * We need to check if the input path the user entered is conform our code.
   * @param toCleanPath input path
   */
  // TODO: Is this Windows-proof? ...
  public static makePath(toCleanPath: string): string {
    if (! toCleanPath.endsWith('/')) {
      toCleanPath += '/';
    }
    return toCleanPath;
  }

}
