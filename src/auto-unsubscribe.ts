import { Unsubscribable } from 'rxjs';

let isAutoUnsubscribeSet = false;
let subscribers: Unsubscribable[] = [];

export function autoUnsubscribe(): void {
  /* istanbul ignore if */
  if (!afterEach) {
    throw new Error(`
    autoUnsubscribe only works with frameworks that have an "afterEach" function,
    like Jasmine or Jest.
    If you want to add support to more frameworks please submit a PR :)
    `);
  }

  isAutoUnsubscribeSet = true;
  afterEach(() => {
    unsubscribeFromAll();
  });
}

export function queueForAutoUnsubscribe(subscription: Unsubscribable): void {
  if (isAutoUnsubscribeSet) {
    subscribers.push(subscription);
  }
}

export function getGlobalSubscribersLength(): number {
  return subscribers.length;
}

export function resetAutoUnsubscribe(): void {
  isAutoUnsubscribeSet = false;
}

function unsubscribeFromAll(): void {
  subscribers.forEach((sub) => {
    sub.unsubscribe();
  });
  subscribers = [];
}
