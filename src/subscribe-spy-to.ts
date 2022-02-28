import { Observable } from 'rxjs';
import { queueForAutoUnsubscribe } from './auto-unsubscribe';
import { SubscriberSpy } from './subscriber-spy';
import { ObserverSpyConfig } from './observer-spy';

export function subscribeSpyTo<T>(
  observableUnderTest: Observable<T>,
  config?: ObserverSpyConfig
): SubscriberSpy<T> {
  const spy = new SubscriberSpy(observableUnderTest, config);
  queueForAutoUnsubscribe(spy);
  return spy;
}

/* istanbul ignore next */
export function subscribeAndSpyOn<T>(
  observableUnderTest: Observable<T>
): SubscriberSpy<T> {
  console.warn(
    'subscribeAndSpyOn is deprecated and will be removed in the next version, please use "subscribeSpyTo" instead.'
  );
  return subscribeSpyTo(observableUnderTest);
}
