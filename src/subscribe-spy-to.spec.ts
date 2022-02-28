import { of, Subject, throwError } from 'rxjs';
import { subscribeSpyTo } from './subscribe-spy-to';

describe('subscribeSpyTo', () => {
  given('a subject that emits an initial value', () => {
    const fakeSubject = new Subject<number>();
    fakeSubject.next(1);

    when('subscribing with a SubscriberSpy, emitting 2 values and unsubscribing', () => {
      const observerSpy = subscribeSpyTo(fakeSubject.asObservable());

      fakeSubject.next(2);
      fakeSubject.next(3);
      observerSpy.unsubscribe();

      fakeSubject.next(4);
      fakeSubject.complete();

      then('it should match the values emitted during subscription period', () => {
        expect(observerSpy.getFirstValue()).toBe(2);
        expect(observerSpy.getLastValue()).toBe(3);
      });
    });
  });

  given('an error throwing observable', () => {
    const errorThrowingObservable = throwError(() => 'FAKE ERROR');

    when('subscribing with a SubscriberSpy and expecting an error', () => {
      const observerSpy = subscribeSpyTo(errorThrowingObservable, { expectErrors: true });

      then('it should receive an error and not rethrow', () => {
        expect(observerSpy.getError()).toBe('FAKE ERROR');
      });
    });
  });
});
