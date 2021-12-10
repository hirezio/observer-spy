import { TestScheduler } from 'rxjs/testing';

export function fakeTime(callback: (...args: any[]) => any) {
  if (callback.length === 0) {
    throw new Error(`
    "fakeTime()" callback must be declared with at least one parameter
    For example: fakeAsync((flush)=> ...)
    `);
  }

  if (callback.length === 1) {
    return function () {
      /* istanbul ignore next */
      const testScheduler = new TestScheduler(() => {});

      return testScheduler.run(({ flush }) => {
        return callback(flush);
      });
    };
  }

  return function (done: () => void) {
    /* istanbul ignore next */
    const testScheduler = new TestScheduler(() => {});

    return testScheduler.run(({ flush }) => {
      return callback(flush, done);
    });
  };
}
