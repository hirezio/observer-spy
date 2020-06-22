import { Observable } from 'rxjs';
import { queueForAutoUnsubscribe } from './auto-unsubscribe';
import { SubscriberSpy } from './subscriber-spy';

export function subscribeSpyTo<T>(observableUnderTest: Observable<T>) {
  const spy = new SubscriberSpy(observableUnderTest);
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
