import { Observable, of, throwError, timer } from 'rxjs';
import { delay, switchMap } from 'rxjs/operators';
import { ObserverSpy } from './observer-spy';

describe('ObserverSpy', () => {
  describe(`GIVEN the observable emits 3 values and completes
            WHEN subscribing`, () => {
    function getSpyAndObservableWith3Values() {
      const observerSpy: ObserverSpy<string> = new ObserverSpy();
      const fakeValues: any[] = ['first', 'second', 'third'];
      const fakeObservable: Observable<string> = of(...fakeValues);

      return {
        observerSpy,
        fakeValues,
        fakeObservable,
      };
    }

    it('should set receivedNext to true', () => {
      const { observerSpy, fakeObservable } = getSpyAndObservableWith3Values();

      fakeObservable.subscribe(observerSpy).unsubscribe();

      expect(observerSpy.receivedNext()).toBe(true);
    });

    it('should return the right values', () => {
      const {
        observerSpy,
        fakeObservable,
        fakeValues,
      } = getSpyAndObservableWith3Values();

      fakeObservable.subscribe(observerSpy).unsubscribe();

      expect(observerSpy.getValues()).toEqual(fakeValues);
    });

    it('should return the values length of 3', () => {
      const { observerSpy, fakeObservable } = getSpyAndObservableWith3Values();

      fakeObservable.subscribe(observerSpy).unsubscribe();

      expect(observerSpy.getValuesLength()).toEqual(3);
    });

    it('should be able to return the correct first value', () => {
      const { observerSpy, fakeObservable } = getSpyAndObservableWith3Values();

      fakeObservable.subscribe(observerSpy).unsubscribe();

      expect(observerSpy.getFirstValue()).toEqual('first');
    });

    it('should be able to return the correct value at any index', () => {
      const { observerSpy, fakeObservable } = getSpyAndObservableWith3Values();

      fakeObservable.subscribe(observerSpy).unsubscribe();

      expect(observerSpy.getValueAt(1)).toEqual('second');
    });

    it('should be able to return the correct last value', () => {
      const { observerSpy, fakeObservable } = getSpyAndObservableWith3Values();

      fakeObservable.subscribe(observerSpy).unsubscribe();

      expect(observerSpy.getLastValue()).toEqual('third');
    });

    it('should know whether it got a "complete" notification', () => {
      const { observerSpy, fakeObservable } = getSpyAndObservableWith3Values();

      fakeObservable.subscribe(observerSpy).unsubscribe();

      expect(observerSpy.receivedComplete()).toBe(true);
    });

    it('should be able to call a callback when it completes synchronously', (done) => {
      const { observerSpy, fakeObservable } = getSpyAndObservableWith3Values();

      fakeObservable.subscribe(observerSpy);

      observerSpy.onComplete(() => {
        expect(observerSpy.receivedComplete()).toBe(true);
        done();
      });
    });

    it('should return a resolved promise when it completes synchronously', async () => {
      const { observerSpy, fakeObservable } = getSpyAndObservableWith3Values();

      fakeObservable.subscribe(observerSpy);

      await observerSpy.onComplete();
      expect(observerSpy.receivedComplete()).toBe(true);
    });

    it('should be able to call a callback when it completes asynchronously', (done) => {
      const { observerSpy, fakeObservable } = getSpyAndObservableWith3Values();

      fakeObservable.pipe(delay(1)).subscribe(observerSpy);

      observerSpy.onComplete(() => {
        expect(observerSpy.receivedComplete()).toBe(true);
        done();
      });
    });

    it('should return a resolved promise when it completes asynchronously', async () => {
      const { observerSpy, fakeObservable } = getSpyAndObservableWith3Values();

      fakeObservable.pipe(delay(1)).subscribe(observerSpy);

      await observerSpy.onComplete();
      expect(observerSpy.receivedComplete()).toBe(true);
    });
  });

  describe('GIVEN observable throws WHEN subscribing', () => {
    const FAKE_ERROR_MESSAGE = 'FAKE ERROR';
    function getThrowingObservable() {
      const throwingObservable: Observable<string> = throwError(FAKE_ERROR_MESSAGE);

      return {
        throwingObservable,
      };
    }

    it('should throw the original error if "expectErrors" is NOT configured', () => {
      const observerSpy: ObserverSpy<string> = new ObserverSpy();
      try {
        observerSpy.error(FAKE_ERROR_MESSAGE);
      } catch (expectedError) {
        expect(expectedError).toBe(FAKE_ERROR_MESSAGE);
      }
    });

    it('should know whether it got an "error" notification if "expectErrors" is configured', () => {
      const observerSpy: ObserverSpy<string> = new ObserverSpy();
      observerSpy.expectErrors();
      const { throwingObservable } = getThrowingObservable();

      throwingObservable.subscribe(observerSpy).unsubscribe();

      expect(observerSpy.receivedError()).toBe(true);
    });

    it('should know whether it got an "error" notification if "expectErrors" was called', () => {
      const observerSpy: ObserverSpy<string> = new ObserverSpy<string>().expectErrors();
      const { throwingObservable } = getThrowingObservable();

      throwingObservable.subscribe(observerSpy).unsubscribe();

      expect(observerSpy.receivedError()).toBe(true);
    });

    it('should return the error object it received if "expectErrors" is configured', () => {
      const observerSpy: ObserverSpy<string> = new ObserverSpy({ expectErrors: true });
      const { throwingObservable } = getThrowingObservable();

      throwingObservable.subscribe(observerSpy).unsubscribe();

      expect(observerSpy.getError()).toEqual(FAKE_ERROR_MESSAGE);
    });

    it('should be able to await "onError" if error already received', async () => {
      const observerSpy: ObserverSpy<string> = new ObserverSpy({ expectErrors: true });
      const { throwingObservable } = getThrowingObservable();

      throwingObservable.subscribe(observerSpy).unsubscribe();

      await observerSpy.onError();

      expect(observerSpy.getError()).toEqual(FAKE_ERROR_MESSAGE);
    });
  });

  describe('GIVEN observable is throwing with delay', () => {
    const FAKE_ERROR_MESSAGE = 'FAKE ERROR';
    function getThrowingObservableWithDelay() {
      const throwingObservable: Observable<string> = timer(1).pipe(
        switchMap(() => throwError(FAKE_ERROR_MESSAGE))
      );

      return {
        throwingObservable,
      };
    }
    it('should be able to await "onError" and check the error', async () => {
      const observerSpy: ObserverSpy<string> = new ObserverSpy({ expectErrors: true });
      const { throwingObservable } = getThrowingObservableWithDelay();

      throwingObservable.subscribe(observerSpy);

      await observerSpy.onError();

      expect(observerSpy.getError()).toEqual(FAKE_ERROR_MESSAGE);
    });
  });
});
