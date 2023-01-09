import { describe, expect, jest, test } from '@jest/globals';
import { retry, wait } from '../src/utils';

describe('utils', () => {
  describe('wait', () => {
    test('should wait 500 ms', async () => {
      const startTime = Date.now();
      await wait(500);
      const endTime = Date.now();
      expect(endTime - startTime).toBeGreaterThan(450);
    });
  });

  describe('retry', () => {
    test('should run only once', async () => {
      const fn = jest.fn(async () => true);
      const result = await retry(fn, 1000, 5);

      expect(result).toBeTruthy();
      expect(fn).toBeCalledTimes(1);
    });

    test('should run twice', async () => {
      const fn = jest
        .fn(async () => true)
        .mockRejectedValueOnce(new Error())
        .mockResolvedValueOnce(true);
      const result = await retry(fn, 1000, 5);

      expect(result).toBeTruthy();
      expect(fn).toBeCalledTimes(2);
    });

    test('should throw an error when the number of tries is exceeded', async () => {
      const fn = jest.fn(async () => {
        throw new Error();
      });

      await expect(retry(fn, 1, 5)).rejects.toThrowError();
      expect(fn).toBeCalledTimes(5);
    });
  });
});
