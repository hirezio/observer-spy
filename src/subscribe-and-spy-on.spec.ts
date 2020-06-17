import { Subject } from 'rxjs';
import { subscribeAndSpyOn } from './subscribe-and-spy-on';

describe('subscribeAndSpyOn', () => {
  it('should match with given subscription points', () => {
    const fakeSubject = new Subject<number>();
    fakeSubject.next(1);
    const observerSpy = subscribeAndSpyOn(fakeSubject.asObservable());

    fakeSubject.next(2);
    fakeSubject.next(3);
    observerSpy.unsubscribe();

    fakeSubject.next(4);
    fakeSubject.complete();

    expect(observerSpy.getFirstValue()).toBe(2);
    expect(observerSpy.getLastValue()).toBe(3);
  });
});
