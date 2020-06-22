import { Observable, throwError, Subscription, from } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { delay } from 'rxjs/operators';

import { ObserverSpy, CompletionCallback } from './observer-spy';

describe('Observer-Spy', () => {
  describe(`given an observable emits 3 values and completes`, () => {
    it('should set receivedNext to true', () => {
      const [oSpy, , , disconnect] = makeObservableAndSpy();

      disconnect();
      expect(oSpy.state.called.next).toBe(true);
    });

    it('should return the right values', () => {
      const [oSpy, , list, disconnect] = makeObservableAndSpy();
      disconnect(); // disconnect and freeze spy

      expect(oSpy.values).toEqual(list);
    });

    it('should be able to return the correct first value', () => {
      const [oSpy, , list, disconnect] = makeObservableAndSpy();
      disconnect();

      expect(oSpy.readFirst()).toEqual(list[0]);
    });

    it('should be able to return the correct value at any index', () => {
      const [oSpy, , list, disconnect] = makeObservableAndSpy();
      disconnect();

      expect(oSpy.values[1]).toEqual(list[1]);
    });

    it('should be able to return the correct last value', () => {
      const [oSpy, , list, disconnect] = makeObservableAndSpy();
      disconnect();

      expect(oSpy.readLast()).toEqual(list[2]);
    });

    it('should know whether it got a "complete" notification', () => {
      const [oSpy, , , disconnect] = makeObservableAndSpy();
      disconnect();

      expect(oSpy.state.called.complete).toBe(true);
    });

    it('should be able to call a callback when it completes synchronously ', (done) => {
      const onComplete: CompletionCallback = (spy: ObserverSpy<any>) => {
        expect(spy.state.called.complete).toBe(true);
        done();
      };

      makeObservableAndSpy(onComplete);
    });

    it('should be able to call a callback when it completes asynchronously', (done) => {
      const autoSubscribe = false;
      const onComplete: CompletionCallback = (spy: ObserverSpy<any>) => {
        expect(spy.state.called.complete).toBe(true);
        done();
      };

      makeTestScheduler().run(({ flush }) => {
        const [oSpy, source$] = makeObservableAndSpy(onComplete, autoSubscribe);
        const subscription = source$.pipe(delay(1)).subscribe(oSpy);

        flush();
        subscription.unsubscribe();
      });
    });
  });

  describe('with an observable that throws Error', () => {
    function getThrowingObservable(): [ObserverSpy<string>, Observable<string>] {
      const oSpy: ObserverSpy<string> = new ObserverSpy();
      const throwingObservable: Observable<string> = throwError('FAKE ERROR');

      return [oSpy, throwingObservable];
    }

    it('should know whether it got an "error" notification', () => {
      const [oSpy, source$] = getThrowingObservable();

      source$.subscribe(oSpy).unsubscribe();
      expect(oSpy.state.called.error).toBe(true);
    });

    it('should return the error object it received', () => {
      const [oSpy, source$] = getThrowingObservable();

      source$.subscribe(oSpy).unsubscribe();
      expect(oSpy.state.errorValue).toEqual('FAKE ERROR');
    });
  });
});

type Testables = [ObserverSpy<string>, Observable<string>, string[], () => void];

function makeObservableAndSpy(
  onComplete?: CompletionCallback,
  autoSubscribe = true
): Testables {
  let subscription: Subscription;

  const oSpy: ObserverSpy<string> = new ObserverSpy(onComplete);
  const list: any[] = ['first', 'second', 'third'];
  const source$: Observable<string> = from(list);
  const dispose = () => subscription && subscription.unsubscribe();

  if (autoSubscribe) {
    subscription = source$.subscribe(oSpy);
  }

  return [oSpy, source$, list, dispose];
}

function makeTestScheduler() {
  return new TestScheduler((actual, expected) => {
    expect(actual).toEqual(expected);
  });
}
