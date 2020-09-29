import { Observable } from 'rxjs';
import { queueForAutoUnsubscribe } from './auto-unsubscribe';
import { SubscriberSpy } from './subscriber-spy';
import { ObserverSpyConfig } from './observer-spy';

export function subscribeSpyTo<T>(
  observableUnderTest: Observable<T>,
  config?: ObserverSpyConfig
) {
  const spy = new SubscriberSpy(observableUnderTest, config);
  queueForAutoUnsubscribe(spy);
  return spy;
}

/* istanbul ignore next */
export function subscribeAndSpyOn<T>(observableUnderTest: Observable<T>) {
  // tslint:disable-next-line:no-console
  console.warn(
    'subscribeAndSpyOn is deprecated and will be removed in the next version, please use "subscribeSpyTo" instead.'
  );
  return subscribeSpyTo(observableUnderTest);
}
