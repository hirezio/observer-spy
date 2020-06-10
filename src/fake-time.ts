import { VirtualTimeScheduler } from 'rxjs';
import { AsyncScheduler } from 'rxjs/internal/scheduler/AsyncScheduler';

export function fakeTime(callback: (...args: any[]) => any) {
  if (callback.length === 0) {
    throw new Error(`
    "fakeTime()" callback must be declared with at least one parameter
    For example: fakeAsync((flush)=> ...)
    `);
  }

  if (callback.length === 1) {
    return function () {
      const virtualScheduler = new VirtualTimeScheduler();
      AsyncScheduler.delegate = virtualScheduler;

      function customFlush() {
        virtualScheduler.flush();
      }
      const originalReturnedValue = callback(customFlush);

      AsyncScheduler.delegate = undefined;

      return originalReturnedValue;
    };
  }

  return function (done: () => void) {
    const virtualScheduler = new VirtualTimeScheduler();
    AsyncScheduler.delegate = virtualScheduler;

    function customFlush() {
      virtualScheduler.flush();
    }
    const originalReturnedValue = callback(customFlush, done);

    AsyncScheduler.delegate = undefined;

    return originalReturnedValue;
  };
}
