import { Subscription, Observable, Unsubscribable } from 'rxjs';
import { ObserverSpy } from '.';
import { ObserverSpyConfig } from './observer-spy';

export class SubscriberSpy<T> extends ObserverSpy<T> implements Unsubscribable {
  public subscription = new Subscription();

  constructor(observableUnderTest: Observable<T>, config?: ObserverSpyConfig) {
    super(config);
    this.subscription.add(observableUnderTest.subscribe(this));
  }

  unsubscribe(): void {
    this.subscription.unsubscribe();
  }
}

/* istanbul ignore next */
export class ObserverSpyWithSubscription<T> extends SubscriberSpy<T> {
  constructor(observableUnderTest: Observable<T>) {
    console.warn(
      'ObserverSpyWithSubscription is deprecated and will be removed in the next version, please use "SubscriberSpy" instead.'
    );
    super(observableUnderTest);
  }
}
