import { Subject, throwError } from 'rxjs';
import { subscribeSpyTo } from './subscribe-spy-to';

describe('subscribeSpyTo', () => {
  it('should match with given subscription points', () => {
    const fakeSubject = new Subject<number>();
    fakeSubject.next(1);
    const observerSpy = subscribeSpyTo(fakeSubject.asObservable());

    fakeSubject.next(2);
    fakeSubject.next(3);
    observerSpy.unsubscribe();

    fakeSubject.next(4);
    fakeSubject.complete();

    expect(observerSpy.getFirstValue()).toBe(2);
    expect(observerSpy.getLastValue()).toBe(3);
  });

  it('should respect "expectErrors" configuration', () => {
    const observerSpy = subscribeSpyTo(throwError('FAKE ERROR'), { expectErrors: true });

    expect(observerSpy.getError()).toBe('FAKE ERROR');
  });
});
