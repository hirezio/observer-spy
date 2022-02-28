import { Observable } from 'rxjs';
import { autoUnsubscribe, resetAutoUnsubscribe } from './auto-unsubscribe';
import { subscribeSpyTo } from './subscribe-spy-to';

const root = (1, eval)('this');

describe('autoUnsubscribe', () => {
  let afterEachCache: (() => void)[];

  beforeEach(() => {
    afterEachCache = [];

    jest
      .spyOn(root, 'afterEach')
      .mockImplementation((fn: any) => afterEachCache.push(fn));
  });

  afterEach(() => {
    resetAutoUnsubscribe();
  });

  given(
    `autoUnsubscribe is configured 
         and a subscriberSpy with a spied on 'unsubscribe' method
         is subscribed to an empty observable`,
    () => {
      autoUnsubscribe();

      const subscriberSpy = subscribeSpyTo(new Observable());
      jest.spyOn(subscriberSpy, 'unsubscribe').mockImplementation();

      when('afterEach cached function runs, simulating the real afterEach', () => {
        afterEachCache.forEach((fn) => fn());

        then('it should be unsubscribed automatically after the test ends', () => {
          expect(subscriberSpy.unsubscribe).toHaveBeenCalledTimes(1);
        });
      });
    }
  );

  given(
    `autoUnsubscribe is NOT configured 
         and a subscriberSpy with a spied on 'unsubscribe' method
         is subscribed to an empty observable`,
    () => {
      const subscriberSpy = subscribeSpyTo(new Observable());
      jest.spyOn(subscriberSpy, 'unsubscribe').mockImplementation();

      when('afterEach cached function runs, simulating the real afterEach', () => {
        afterEachCache.forEach((fn) => fn());

        then('it should NOT be unsubscribed automatically after the test ends', () => {
          expect(subscriberSpy.unsubscribe).not.toHaveBeenCalled();
        });
      });
    }
  );
});
