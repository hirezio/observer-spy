import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
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
    function getThrowingObservable() {
      const observerSpy: ObserverSpy<string> = new ObserverSpy();
      const throwingObservable: Observable<string> = throwError('FAKE ERROR');

      return {
        observerSpy,
        throwingObservable,
      };
    }

    it('should know whether it got an "error" notification', () => {
      const { observerSpy, throwingObservable } = getThrowingObservable();

      throwingObservable.subscribe(observerSpy).unsubscribe();

      expect(observerSpy.receivedError()).toBe(true);
    });

    it('should return the error object it received', () => {
      const { observerSpy, throwingObservable } = getThrowingObservable();

      throwingObservable.subscribe(observerSpy).unsubscribe();

      expect(observerSpy.getError()).toEqual('FAKE ERROR');
    });
  });
});
