import { ObserverSpy, CompletionCallback } from './observer-spy';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { fakeTime } from './fake-time';

describe('fakeTime', () => {
  function getDelayedObservable(
    onComplete?: CompletionCallback
  ): [ObserverSpy<string>, Observable<string>, string[]] {
    const VALUES = ['first', 'second', 'third'];
    const observerSpy: ObserverSpy<string> = new ObserverSpy(onComplete);
    const source$: Observable<string> = of(...VALUES).pipe(delay(20000));

    return [observerSpy, source$, VALUES];
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
      const [observerSpy, source$, VALUES] = getDelayedObservable();

      const sub = source$.subscribe(observerSpy);
      flush();
      sub.unsubscribe();

      expect(observerSpy.values).toEqual(VALUES);
    })
  );

  it(
    'should handle be able to deal with done functionality as well',
    fakeTime((flush, done) => {
      const onComplete: CompletionCallback = () => {
        expect(spy.values).toEqual(VALUES);
        done();
      };
      const [spy, source$, VALUES] = getDelayedObservable(onComplete);

      const sub = source$.subscribe(spy);
      flush();
      sub.unsubscribe();
    })
  );
});
