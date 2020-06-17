import { Observable, Subscription } from 'rxjs';
import { ObserverSpy } from './observer-spy';

export function subscribeAndSpyOn<T>(observableUnderTest: Observable<T>) {
  return new ObserverSpyWithSubscription(observableUnderTest);
}

export class ObserverSpyWithSubscription<T> extends ObserverSpy<T> {
  public subscription = new Subscription();

  constructor(observableUnderTest: Observable<T>) {
    super();
    this.subscription.add(observableUnderTest.subscribe(this));
  }

  unsubscribe(): void {
    this.subscription.unsubscribe();
  }
}
