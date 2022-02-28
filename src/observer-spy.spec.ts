import { Observable, of, throwError, timer } from 'rxjs';
import { delay, switchMap } from 'rxjs/operators';
import { ObserverSpy } from './observer-spy';
import { subscribeSpyTo } from './subscribe-spy-to';

describe('ObserverSpy', () => {
  describe(`querying the observerSpy`, () => {
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

    given('observable with 3 fake values', () => {
      const fakeValues: any[] = ['first', 'second', 'third'];
      const fakeObservable: Observable<string> = of(...fakeValues);

      when('subscribing with observerSpy', () => {
        const observerSpy: ObserverSpy<string> = new ObserverSpy();
        fakeObservable.subscribe(observerSpy).unsubscribe();

        then('all queries should work', () => {
          expect(observerSpy.receivedNext()).toBe(true);
          expect(observerSpy.getValues()).toEqual(fakeValues);
          expect(observerSpy.getValuesLength()).toEqual(3);
          expect(observerSpy.getFirstValue()).toEqual('first');
          expect(observerSpy.getValueAt(1)).toEqual('second');
          expect(observerSpy.getLastValue()).toEqual('third');
          expect(observerSpy.receivedComplete()).toBe(true);
        });
      });
    });

    // ----------------------------------------------------

    given('an observable which completes immediately', (done) => {
      const fakeObservable: Observable<string> = of();

      when('subscribing with observerSpy', () => {
        const observerSpy: ObserverSpy<string> = new ObserverSpy();
        fakeObservable.subscribe(observerSpy);

        then('should be able to call a callback when it completes synchronously', () => {
          observerSpy.onComplete(() => {
            expect(observerSpy.receivedComplete()).toBe(true);
            done();
          });
        });
      });
    });

    given('an observable which completes immediately', () => {
      const fakeObservable: Observable<string> = of();

      when('subscribing with observerSpy and awaiting the complete event', async () => {
        const observerSpy: ObserverSpy<string> = new ObserverSpy();
        fakeObservable.subscribe(observerSpy).unsubscribe();
        await observerSpy.onComplete();

        then('a "complete" notification should be received', () => {
          expect(observerSpy.receivedComplete()).toBe(true);
        });
      });
    });

    given('an observable with a delay', (done) => {
      const fakeObservable: Observable<string> = of('fake value').pipe(delay(1));

      when('subscribing with observerSpy', () => {
        const observerSpy: ObserverSpy<string> = new ObserverSpy();
        fakeObservable.subscribe(observerSpy);

        then('a callback should be called when it completes asynchronously', () => {
          observerSpy.onComplete(() => {
            expect(observerSpy.receivedComplete()).toBe(true);
            done();
          });
        });
      });
    });

    given('a observable with a delay', () => {
      const fakeObservable: Observable<string> = of('fake value').pipe(delay(1));

      when('subscribing with observerSpy and awaiting the complete event', async () => {
        const observerSpy: ObserverSpy<string> = new ObserverSpy();
        fakeObservable.subscribe(observerSpy).unsubscribe();
        await observerSpy.onComplete();

        then('a "complete" notification should be received', () => {
          expect(observerSpy.receivedComplete()).toBe(true);
        });
      });
    });
  });

  describe('handling errors', () => {
    const FAKE_ERROR_MESSAGE = 'FAKE ERROR';

    given('an observerSpy with an "expectErrors" NOT configured', () => {
      const observerSpy: ObserverSpy<string> = new ObserverSpy();

      when('triggering an error with a fake message', () => {
        try {
          observerSpy.error(FAKE_ERROR_MESSAGE);
        } catch (expectedError) {
          then('should return the original error', () => {
            expect(expectedError).toBe(FAKE_ERROR_MESSAGE);
          });
        }
      });
    });

    given(
      `an observerSpy with an "expectErrors" configured
       AND an error throwing observable`,
      () => {
        const observerSpy: ObserverSpy<string> = new ObserverSpy();
        observerSpy.expectErrors();
        const throwingObservable: Observable<string> = throwError(
          () => FAKE_ERROR_MESSAGE
        );

        when('subscribing with observerSpy', () => {
          throwingObservable.subscribe(observerSpy).unsubscribe();

          then('should know whether it got an "error" notification', () => {
            expect(observerSpy.receivedError()).toBe(true);
          });
        });
      }
    );

    given(
      `an observerSpy with an "expectErrors" configured via the constructor
       AND an error throwing observable`,
      () => {
        const observerSpy: ObserverSpy<string> = new ObserverSpy({ expectErrors: true });
        const throwingObservable: Observable<string> = throwError(
          () => FAKE_ERROR_MESSAGE
        );

        when('subscribing with observerSpy', () => {
          throwingObservable.subscribe(observerSpy).unsubscribe();

          then('should return the observable error value', () => {
            expect(observerSpy.getError()).toEqual(FAKE_ERROR_MESSAGE);
          });
        });
      }
    );

    given(
      `an observerSpy with an "expectErrors" configured via the constructor
       and an error throwing observable`,
      () => {
        const observerSpy: ObserverSpy<string> = new ObserverSpy({ expectErrors: true });
        const throwingObservable: Observable<string> = throwError(
          () => FAKE_ERROR_MESSAGE
        );

        when('subscribing with observerSpy and awaiting the error', async () => {
          throwingObservable.subscribe(observerSpy).unsubscribe();
          await observerSpy.onError();

          then('should return the observable error value', () => {
            expect(observerSpy.getError()).toEqual(FAKE_ERROR_MESSAGE);
          });
        });
      }
    );

    // ***
    given(
      `an observerSpy with an "expectErrors" called to configure it
       and an error throwing observable`,
      () => {
        const observerSpy: ObserverSpy<string> = new ObserverSpy();
        observerSpy.expectErrors();
        const throwingObservable: Observable<string> = throwError(
          () => FAKE_ERROR_MESSAGE
        );

        when(
          `getting the errorPromise before subscribing with observerSpy 
           and awaiting the error state`,
          async () => {
            const errorPromise = observerSpy.onError();
            throwingObservable.subscribe(observerSpy).unsubscribe();
            await errorPromise;

            then('should return the observable error value', () => {
              expect(observerSpy.getError()).toEqual(FAKE_ERROR_MESSAGE);
            });
          }
        );
      }
    );

    given(
      `an observerSpy with an "expectErrors" configured via the constructor
       and a DELAYED error throwing observable`,
      () => {
        const observerSpy: ObserverSpy<string> = new ObserverSpy({ expectErrors: true });
        const throwingObservable: Observable<string> = timer(1).pipe(
          switchMap(() => throwError(() => FAKE_ERROR_MESSAGE))
        );

        when('subscribing with observerSpy and awaiting the error', async () => {
          throwingObservable.subscribe(observerSpy).unsubscribe();
          await observerSpy.onError();

          then('should return the observable error value', () => {
            expect(observerSpy.getError()).toEqual(FAKE_ERROR_MESSAGE);
          });
        });
      }
    );
  });
});
