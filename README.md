# @hirez_io/observer-spy 👀💪

This library makes RxJS Observables testing easy!

[![npm version](https://img.shields.io/npm/v/@hirez_io/observer-spy.svg?style=flat-square)](https://www.npmjs.org/package/@hirez_io/observer-spy)
[![npm downloads](https://img.shields.io/npm/dm/@hirez_io/observer-spy.svg?style=flat-square)](http://npm-stat.com/charts.html?package=@hirez_io/observer-spy&from=2017-07-26)
![Build](https://github.com/hirezio/observer-spy/workflows/Build/badge.svg)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![codecov](https://img.shields.io/codecov/c/github/hirezio/observer-spy.svg)](https://codecov.io/gh/hirezio/observer-spy) <!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-6-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

<br/>

<div align="center">
  <a href="https://learn.hirez.io/?utm_source=github&utm_medium=link&utm_campaign=observer-spy">
    <img src="for-readme/test-angular.jpg"
      alt="TestAngular.com - Free Angular Testing Workshop - The Roadmap to Angular Testing Mastery"
      width="600"
    />
  </a>
</div>

<br/>

# Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


  - [Installation](#installation)
  - [The Problem](#the-problem-testing-rxjs-observables-is-hard-)
  - [The Solution](#the-solution-observer-spies-)
- [Usage](#usage)
  - [`subscribeSpyTo(observable)`](#const-observerspy--subscribespytoobservable)
  - [`onComplete` (using `async` + `await`)](#wait-for-oncomplete-before-expecting-the-result-using-async--await)
  - [Spying on Errors (`expectErrors`)](#spy-on-errors-with-receivederror-and-geterror)
  - [`onError` (using `async` + `await`)](#wait-for-onerror-before-expecting-the-result-using-async--await)
  - [Manually Creating Spies](#manually-using-new-observerspy)
  - [Auto Unsubscribing](#auto-unsubscribing)
  - [Testing Sync Logic](#testing-sync-logic)

  - [Testing Async Logic](#testing-async-logic)
      - [▶ RxJS  + Angular: use `fakeAsync`](#-rxjs---angular-use-fakeasync)

      - [▶ RxJS + Promises: use `async` + `await`](#-rxjs--promises-use-async--await)
    
      - [▶ RxJS Timers / Animations: use `fakeTime`](#-rxjs-timers--animations-use-faketime)
      - [▶ RxJS + _AJAX_ calls:](#-rxjs--ajax-calls)
  

- [🧠 Wanna become a PRO Observables tester?](#-wanna-become-a-pro-observables-tester)
- [How to Contribute](#contributing)
- [Code Of Conduct](#code-of-conduct)
- [Contributors ✨](#contributors-)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

<br/>

## Installation

```console
yarn add -D @hirez_io/observer-spy
```

or

```console
npm install -D @hirez_io/observer-spy
```

<br/>


## THE PROBLEM: Testing RxJS observables is hard! 😓

Especially when testing advanced use cases.

Until this library, the common way to test observables was to use [Marble tests](https://rxjs-dev.firebaseapp.com/guide/testing/internal-marble-tests)

### What are the disadvantages of Marble Tests?

Marble tests are very powerful, but unfortunately for most tests they are conceptually very complicated to learn and to reason about..


You need to learn and understand `cold` and `hot` observables, `schedulers` and to learn a new syntax just to test a simple observable chain.

More complex observable chains tests get even harder to read and to maintain.

<br/>
<br/>

## THE SOLUTION: Observer Spies! 👀💪

The **Observer-Spy** library was created to present a viable alternative to Marble Tests.

An alternative which we believe is:

* ✅ **Easier** to understand

* ✅ **Reduces** the complexity

* ✅ Makes observables tests **cleaner**
 
<br/>

### Here's what people had to say:

![image](https://user-images.githubusercontent.com/1430726/95263162-0cbe8200-0836-11eb-9d78-45a7e64c38f7.png)

---

![image](https://user-images.githubusercontent.com/1430726/95263462-7dfe3500-0836-11eb-8aca-0d9283b2d66b.png)

---

<br/>


## Why Observer-Spy is easier?

### 😮 Marble test: 

```js

import { TestScheduler } from 'rxjs/testing';

let scheduler: TestScheduler;

beforeEach(()=>{
  scheduler = new TestScheduler((actual, expected) => {
    expect(actual).toEqual(expected)
  })
})

it('should filter even numbers and multiply each number by 10', () => {
  
  scheduler.run(({cold, expectObservable}) => {
    const sourceValues = { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9, j: 10};

    const source$ = cold('-a-b-c-d-e-f-g-h-i-j|', sourceValues);
    const expectedOrder = '-a---b---c---d---e--|';
    const expectedValues = { a: 10, b: 30, c: 50, d: 70, e: 90};
    
    const result$ = source$.pipe(
      filter(n => n % 2 !== 0),
      map(x => x * 10)
    );

    expectObservable(result$).toBe(expectedOrder, expectedValues);
  })
});
```

### 😎 Observer Spy Test:

```js

import { subscribeSpyTo } from '@hirez_io/observer-spy';

it('should filter even numbers and multiply each number by 10', () => {
  
    const result$ = of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10).pipe(
      filter(n => n % 2 !== 0),
      map(x => x * 10)
    );

    const observerSpy = subscribeSpyTo(result$);

    expect(observerSpy.getValues()).toEqual([10, 30, 50, 70, 90]);

  })
});
```


You generally want to test the outcome of your action instead of implementation details [like how many frames were between each value].

For most production app use cases, if enough (virtual) time passes testing the **received values** or their order should be sufficient.

This library gives you the tool to investigate your spy about the values it received and their order. 

(The idea was inspired by [Reactive Programming with RxJava](https://books.google.co.il/books?id=y4Y1DQAAQBAJ))

<br/>

# Usage

<br/>



## `const observerSpy = subscribeSpyTo(observable)`

In order to test Observables you can use the `subscribeSpyTo` function: 

```js
import { subscribeSpyTo } from '@hirez_io/observer-spy';

it('should immediately subscribe and spy on Observable ', () => {
  const fakeObservable = of('first', 'second', 'third');

  // get a special observerSpy of type "SubscriberSpy" (with an additional "unsubscribe" method)
  // if you're using TypeScript you can declare it with a generic:
  // const observerSpy: SubscriberSpy<string> ... 
  const observerSpy = subscribeSpyTo(fakeObservable);

  // You can unsubscribe if you need to:
  observerSpy.unsubscribe();


  // EXPECTATIONS: 
  expect(observerSpy.getFirstValue()).toEqual('first');
  expect(observerSpy.receivedNext()).toBe(true);
  expect(observerSpy.getValues()).toEqual(fakeValues);
  expect(observerSpy.getValuesLength()).toEqual(3);
  expect(observerSpy.getFirstValue()).toEqual('first');
  expect(observerSpy.getValueAt(1)).toEqual('second');
  expect(observerSpy.getLastValue()).toEqual('third');
  expect(observerSpy.receivedComplete()).toBe(true);

  // --------------------------------------------------------

  // You can also use this shorthand version:

  expect(subscribeSpyTo(fakeObservable).getFirstValue()).toEqual('first');

  // --------------------------------------------------------

});
```

<br/>

### Wait for `onComplete` before expecting the result (using `async` + `await`)

```js
it('should support async await for onComplete()', async () => {
  
  const fakeObservable = of('first', 'second', 'third');

  const observerSpy = subscribeSpyTo(fakeObservable);

// 👇
  await observerSpy.onComplete(); // <-- the test will pause here until the observable is complete

  expect(observerSpy.receivedComplete()).toBe(true);

  // If you don't want to use async await you could pass a callback:
  //
  //   observerSpy.onComplete(() => {
  //     expect(observerSpy.receivedComplete()).toBe(true);
  //   }));
});

```

<br/>

### Spy on errors with `receivedError` and `getError`

#### ⚠ You MUST configure `expectErrors` to catch errors!
This 👆 is to avoid swallowing unexpected errors ([more details here](https://github.com/hirezio/observer-spy/issues/20))

```js

it('should spy on Observable errors', () => {

  const fakeObservable = throwError('FAKE ERROR');

  const observerSpy = subscribeSpyTo(fakeObservable, {expectErrors: true});

  expect(observerSpy.receivedError()).toBe(true);

  expect(observerSpy.getError()).toEqual('FAKE ERROR');
});

```

<br/>

### Wait for `onError` before expecting the result (using `async` + `await`)

```js
it('should support async await for onError()', async () => {
  
  const fakeObservable = throwError('FAKE ERROR');

  const observerSpy = subscribeSpyTo(fakeObservable, {expectErrors: true});

// 👇
  await observerSpy.onError(); // <-- the test will pause here until the observer receive the error

  expect(observerSpy.getError()).toEqual('FAKE ERROR');

});

```

<br/>

## Manually using `new ObserverSpy()`

You can create an `ObserverSpy` instance manually:

```js
// ... other imports
import { ObserverSpy } from '@hirez_io/observer-spy';

it('should spy on Observable values', () => {
  
  const fakeValues = ['first', 'second', 'third'];
  const fakeObservable = of(...fakeValues);

  // BTW, if you're using TypeScript you can declare it with a generic:
  // const observerSpy: ObserverSpy<string> = new ObserverSpy();
  const observerSpy = new ObserverSpy();

  // This type of ObserverSpy doesn't have a built in "unsubscribe" method
  // only the "SubscriberSpy" has it, so we need to create a separate "Subscription" variable.
  const subscription = fakeObservable.subscribe(observerSpy);

  // ...DO SOME LOGIC HERE...

  // unsubscribing is optional, it's good for stopping intervals etc
  subscription.unsubscribe();

  expect(observerSpy.getValuesLength()).toEqual(3);

});
```

If you need to spy on errors, make sure to set the `expectErrors` property:

```js
it('should spy on Observable errors', () => {
  
  const fakeObservable = throwError('OOPS');

  const observerSpy = new ObserverSpy({expectErrors: true}); // <-- IMPORTANT
  // OR
  const observerSpy = new ObserverSpy().expectErrors(); // <-- ALTERNATIVE WAY TO SET IT

  // Or even...
  observerSpy.expectErrors(); // <-- ALTERNATIVE WAY TO SET IT
  
  fakeObservable.subscribe(observerSpy);

  expect(observerSpy.receivedError()).toBe(true);

});
```

<br/>


# Auto Unsubscribing

In order to save you the trouble of calling `unsubscribe` in each test, you can configure the library to auto unsubscribe from every observer you create with `subscribeSpyTo()`.


### ⚠ PAY ATTENTION: 

* You should only call `autoUnsubscribe()` once per environment **(not manually after each test!)**. You do it in your testing environment setup files (like `jest.config.js` or `test.ts` in Angular).

* This works **only with subscriptions created** using either `subscribeSpyTo()` or `queueForAutoUnsubscribe()`.

* Currently **it only works** with frameworks like **Jasmine**, **Mocha** and **Jest** (because they have a global `afterEach` function)


This library provide helper functions to help you configure this behavior - 

<br/>

### ⚒ Configuring Jest with `setup-auto-unsubscribe.js`

This requires Jest to be loaded and then calls `autoUnsubscribe()` which sets up a global / root `afterEach` function that unsubscribes from your observer spies.

Add this to your jest configuration (i.e `jest.config.js`):

```js
{
  setupFilesAfterEnv: ['node_modules/@hirez_io/observer-spy/dist/setup-auto-unsubscribe.js'],
}
```

<br/>

### ⚒ Configuring Angular (Karma + Jasmine) with `autoUnsubscribe`

This will add a root level `afterEach()` once that auto unsubscribes observer spies. 

Add this to your `test.ts` - 

```ts
// test.ts
// ~~~~~~~

import { autoUnsubscribe } from '@hirez_io/observer-spy';

autoUnsubscribe();

```

<br/>

### ⚒ Manually adding a subscription with `queueForAutoUnsubscribe`

If you configured your environment to "autoUnsubscribe" and want your manually created spies (via `new ObserverSpy()`) to be "auto unsubscribed" as well, you can use `queueForAutoUnsubscribe(subscription)`.

It accepts any `Unsubscribable` object which has an `unsubscribe()` method -

```js
import { queueForAutoUnsubscribe } from '@hirez_io/observer-spy';


it('should spy on Observable values', () => {
  const fakeValues = ['first', 'second', 'third'];
  const fakeObservable = of(...fakeValues);

  const observerSpy = new ObserverSpy();
  const subscription = fakeObservable.subscribe(observerSpy)
  
  // This will auto unsubscribe this subscription after the test ends
  // (if you configured "autoUnsubscribe()" in your environment)
  queueForAutoUnsubscribe(subscription);

  // ... rest of the test

});
```

This will ensure your manually created spies are auto unsubscribed at the end of each test.
<br/>

# Testing Sync Logic

### ▶ Synchronous RxJS

RxJS - without delaying operators or async execution contexts - will run synchronously. This is the simplest use case; where our `it()` does not need any special asynchronous plugins.

```ts
it('should run synchronously', () => {
  const observerSpy = subscribeSpyTo(from(['first', 'second', 'third']));
  expect(spy.getValuesLength()).toBe(3);
});
```

<br/>

<br/>

# Testing Async Logic

If you're **not using Angular** and have RxJS async operators like `delay` or `timeout` 

Use `fakeTime` with `flush()` to simulate the passage of time ([detailed explanation](#-rxjs-timers--animations-use-faketime)) - 

[![image](https://user-images.githubusercontent.com/210413/85336618-83f92180-b4a4-11ea-800d-6bb275eeda45.png)](#-rxjs-timers--animations-use-faketime)


<br/>

### ▶ RxJS  + Angular: use `fakeAsync`

With Angular, you can control time in a much more versatile way. 

Just use `fakeAsync` (and `tick` if you need it):

```js
// ... other imports
import { subscribeSpyTo } from '@hirez_io/observer-spy';
import { fakeAsync, tick } from '@angular/core/testing';

it('should test Angular code with delay', fakeAsync(() => {
  
  const fakeObservable = of('fake value').pipe(delay(1000));

  const observerSpy = subscribeSpyTo(fakeObservable);

  tick(1000);

  expect(observerSpy.getLastValue()).toEqual('fake value');
}));
```

<br/>

### ▶ RxJS + Promises: use `async` + `await`

Since Promise(s) are [MicroTasks](https://javascript.info/microtask-queue), we should consider them to resolve asynchronously.

For code using _Promise(s)_ **without timeouts or intervals**, just use `async` + `await` with the `onComplete()` method:


```js
// ... other imports
import { subscribeSpyTo } from '@hirez_io/observer-spy';

it('should work with promises', async () => {

  const fakeService = {
    getData() {
      return Promise.resolve('fake data');
    },
  };
  const fakeObservable = defer(() => fakeService.getData());

  const observerSpy = subscribeSpyTo(fakeObservable);

  await observerSpy.onComplete();

  expect(observerSpy.getLastValue()).toEqual('fake data');
});

```

<br/>

### ▶ RxJS Timers / Animations: use `fakeTime`

RxJS code that has time-based logic (e.g using timeouts / intervals / animations) will emit asynchronously. 

`fakeTime()` is a custom utility function that wraps the test callback which is perfect for most of these use-cases.

It does the following things:

1. Changes the RxJS `AsyncScheduler` delegate to use `VirtualTimeScheduler` and use "virtual time".
2. Passes a `flush()` function you can call whenever you want to virtually pass time forward.
3. Works well with `done` if you pass it as the second parameter (instead of the first)

Example:

```js
// ... other imports
import { subscribeSpyTo, fakeTime } from '@hirez_io/observer-spy';

it('should handle delays with a virtual scheduler', fakeTime((flush) => {
    const VALUES = ['first', 'second', 'third'];

    const delayedObservable: Observable<string> = of(...VALUES).pipe(delay(20000));

    const observerSpy = subscribeSpyTo(delayedObservable);
    
    flush(); // <-- passes the "virtual time" forward

    expect(observerSpy.getValues()).toEqual(VALUES);
  })
);

// ===============================================================================

it('should handle done functionality as well', fakeTime((flush, done) => {
    const VALUES = ['first', 'second', 'third'];

    const delayedObservable: Observable<string> = of(...VALUES).pipe(delay(20000));

    const observerSpy = subscribeSpyTo(delayedObservable);
    flush();

    observerSpy.onComplete(() => {
      expect(observerSpy.getValues()).toEqual(VALUES);
      done();
    });
  })
);
```

<br/>

### ▶ RxJS + _AJAX_ calls:

Asynchronous REST calls (using axios, http, fetch, etc.) should not be tested in a unit / micro test... Test those in an integration test! 😜

<br/>
<br/>

# 🧠 Wanna become a PRO Observables tester?

In [Angular Class Testing In action](https://learn.hirez.io/?utm_source=github&utm_medium=link&utm_campaign=observer-spy) course Shai Reznik goes over all the differences and show you how to use observer spies to test complex Observable chains with `switchMap`, `interval` etc...

<br/>
<br/>


## Contributing

Want to contribute? Yayy! 🎉

Please read and follow our [Contributing Guidelines](CONTRIBUTING.md) to learn what are the right steps to take before contributing your time, effort and code.

Thanks 🙏

<br/>

## Code Of Conduct

Be kind to each other and please read our [code of conduct](CODE_OF_CONDUCT.md).

<br/>

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="http://www.hirez.io/"><img src="https://avatars1.githubusercontent.com/u/1430726?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Shai Reznik</b></sub></a><br /><a href="https://github.com/hirezio/observer-spy/commits?author=shairez" title="Code">💻</a> <a href="https://github.com/hirezio/observer-spy/commits?author=shairez" title="Tests">⚠️</a> <a href="#infra-shairez" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/hirezio/observer-spy/commits?author=shairez" title="Documentation">📖</a> <a href="#maintenance-shairez" title="Maintenance">🚧</a> <a href="https://github.com/hirezio/observer-spy/pulls?q=is%3Apr+reviewed-by%3Ashairez" title="Reviewed Pull Requests">👀</a> <a href="#ideas-shairez" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://www.codamit.dev"><img src="https://avatars0.githubusercontent.com/u/8522558?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Edouard Bozon</b></sub></a><br /><a href="https://github.com/hirezio/observer-spy/commits?author=edbzn" title="Code">💻</a> <a href="https://github.com/hirezio/observer-spy/commits?author=edbzn" title="Tests">⚠️</a> <a href="https://github.com/hirezio/observer-spy/commits?author=edbzn" title="Documentation">📖</a> <a href="#ideas-edbzn" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/burkybang"><img src="https://avatars0.githubusercontent.com/u/927886?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Adam Smith</b></sub></a><br /><a href="https://github.com/hirezio/observer-spy/commits?author=burkybang" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/katharinakoal"><img src="https://avatars3.githubusercontent.com/u/17751573?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Katharina Koal</b></sub></a><br /><a href="https://github.com/hirezio/observer-spy/commits?author=katharinakoal" title="Code">💻</a> <a href="https://github.com/hirezio/observer-spy/commits?author=katharinakoal" title="Tests">⚠️</a> <a href="https://github.com/hirezio/observer-spy/commits?author=katharinakoal" title="Documentation">📖</a> <a href="#ideas-katharinakoal" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/hirezio/observer-spy/issues?q=author%3Akatharinakoal" title="Bug reports">🐛</a></td>
    <td align="center"><a href="http://www.linkedin.com/in/thomasburleson"><img src="https://avatars3.githubusercontent.com/u/210413?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Thomas Burleson</b></sub></a><br /><a href="https://github.com/hirezio/observer-spy/commits?author=ThomasBurleson" title="Code">💻</a> <a href="https://github.com/hirezio/observer-spy/commits?author=ThomasBurleson" title="Tests">⚠️</a> <a href="https://github.com/hirezio/observer-spy/commits?author=ThomasBurleson" title="Documentation">📖</a> <a href="#ideas-ThomasBurleson" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://www.armanozak.com/"><img src="https://avatars.githubusercontent.com/u/15855540?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Levent Arman Özak</b></sub></a><br /><a href="https://github.com/hirezio/observer-spy/commits?author=armanozak" title="Documentation">📖</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

<br/>


## License

MIT


