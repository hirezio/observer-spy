import { ObserverSpy } from './observer-spy';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { fakeTime } from './fake-time';

describe('fakeTime', () => {
  function getDelayedObservable() {
    const VALUES = ['first', 'second', 'third'];
    const observerSpy: ObserverSpy<string> = new ObserverSpy();
    const delayedObservable: Observable<string> = of(...VALUES).pipe(delay(20000));

    return {
      VALUES,
      observerSpy,
      delayedObservable,
    };
  }

  it('should fail with no parameters', () => {
    function fakeTimeWithNoParams() {
      fakeTime(() => {});
    }
    expect(fakeTimeWithNoParams).toThrowErrorMatchingSnapshot();
  });

  it(
    'should handle delays with a virtual scheduler',
    fakeTime((flush) => {
      const { observerSpy, delayedObservable, VALUES } = getDelayedObservable();

      const sub = delayedObservable.subscribe(observerSpy);
      flush();
      sub.unsubscribe();

      expect(observerSpy.getValues()).toEqual(VALUES);
    })
  );

  it(
    'should handle be able to deal with done functionality as well',
    fakeTime((flush, done) => {
      const { observerSpy, delayedObservable, VALUES } = getDelayedObservable();

      const sub = delayedObservable.subscribe(observerSpy);
      flush();
      sub.unsubscribe();

      observerSpy.onComplete(() => {
        expect(observerSpy.getValues()).toEqual(VALUES);
        done();
      });
    })
  );

  it(
    'should support async await functionality',
    fakeTime(async (flush) => {
      const { observerSpy, delayedObservable, VALUES } = getDelayedObservable();

      const sub = delayedObservable.subscribe(observerSpy);
      flush();
      sub.unsubscribe();

      await observerSpy.onComplete();
      expect(observerSpy.getValues()).toEqual(VALUES);
    })
  );
});
