import { Observer, Observable, Subscription } from 'rxjs';
import { ObserverSpy, CompletionCallback } from './observer-spy';

/**
 * Define Tuple reponse from spyOn() calls
 */
export type SpyOnResults<T> = [ObserverSpy<T>, () => void];

/**
 * Internal registory of active spy instances
 */
let subscriptions: SpyOnResults<any>[] = [];

/**
 * Internal util function to remove a spy from the global watch list
 */
function removeSpyFromWatchList(target: ObserverSpy<any>) {
  // Rebuild watch list WITHOUT the target spy instance
  subscriptions = subscriptions.reduce(
    (buffer: SpyOnResults<any>[], item: SpyOnResults<any>) => {
      const [spy] = item;
      if (target !== spy) {
        buffer.push(item);
      }
      return buffer;
    },
    []
  );
}

export const SpyUtils = {
  /**
   * Freeze all spys and dispose of any subscriptions
   * Used with tests `afterEach(() => disposeAllSpys())`
   */
  disposeAll() {
    [...subscriptions].map(([spy, dispose]) => {
      spy.freeze(true);
      dispose();
    });

    subscriptions = [];
  },

  /**
   * Allows external world to check for existing subscriptions
   */
  hasSpys(): boolean {
    return subscriptions.length > 0;
  },
};

/**
 * spyOn(): simplify use of ObserverSpy by black-box'ing the
 * ObserverSpy construction and disposal details.
 *
 * @param source Observable<T>
 * @param completionCallback [optional] Callback function invoked when the source stream completes
 */
export function spyOn<T>(
  source: Observable<T>,
  completionCallback?: CompletionCallback
): SpyOnResults<T> {
  const spy = new ObserverSpy<T>(completionCallback);
  const subscription = source.subscribe(spy);
  const dispose = () => {
    subscription.unsubscribe();
    removeSpyFromWatchList(spy);
  };
  const results: SpyOnResults<T> = [spy, dispose];

  subscriptions.push(results);

  return results;
}
