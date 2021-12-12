import { Observable } from 'rxjs';
import {
  autoUnsubscribe,
  getGlobalSubscribersLength,
  resetAutoUnsubscribe,
} from './auto-unsubscribe';
import { subscribeSpyTo } from './subscribe-spy-to';

// tslint:disable-next-line:no-unused-expression
const root = (1, eval)('this');

describe('autoUnsubscribe', () => {
  let afterEachCache: (() => void)[];

  beforeEach(() => {
    afterEachCache = [];

    jest
      .spyOn(root, 'afterEach')
      .mockImplementation((fn: any) => afterEachCache.push(fn));
  });

  it('should auto unsubscribe after the test ends if it was configured with autoUnsubscribe', () => {
    autoUnsubscribe();

    const fakeObservable = new Observable();
    const observerSpy = subscribeSpyTo(fakeObservable);

    expect(getGlobalSubscribersLength()).toBe(1);

    const unsubscribeSpy = jest.spyOn(observerSpy, 'unsubscribe').mockImplementation();
    afterEachCache.forEach((fn) => fn());
    expect(observerSpy.unsubscribe).toHaveBeenCalledTimes(1);
    expect(getGlobalSubscribersLength()).toBe(0);

    // CLEAN UP
    unsubscribeSpy.mockReset();
    observerSpy.unsubscribe();

    resetAutoUnsubscribe();
  });

  it('should NOT auto unsubscribe after the test ends if it was NOT configured with autoUnsubscribe', () => {
    const fakeObservable = new Observable();
    const observerSpy = subscribeSpyTo(fakeObservable);

    expect(getGlobalSubscribersLength()).toBe(0);

    const unsubscribeSpy = jest.spyOn(observerSpy, 'unsubscribe').mockImplementation();

    afterEachCache.forEach((fn) => fn());
    expect(observerSpy.unsubscribe).not.toHaveBeenCalledTimes(1);

    // CLEAN UP
    unsubscribeSpy.mockReset();
    observerSpy.unsubscribe();
  });
});
