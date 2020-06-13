# @hirez_io/observer-spy 👀💪

A simple little class and a helper function that help make Observable testing a breeze

[![npm version](https://img.shields.io/npm/v/@hirez_io/observer-spy.svg?style=flat-square)](https://www.npmjs.org/package/@hirez_io/observer-spy)
[![npm downloads](https://img.shields.io/npm/dm/@hirez_io/observer-spy.svg?style=flat-square)](http://npm-stat.com/charts.html?package=@hirez_io/observer-spy&from=2017-07-26)
[![Build Status](https://travis-ci.org/hirezio/observer-spy.svg?branch=master)](https://travis-ci.org/hirezio/observer-spy)
[![codecov](https://img.shields.io/codecov/c/github/hirezio/observer-spy.svg)](https://codecov.io/gh/hirezio/observer-spy) <!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-2-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END --> [![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

<div align="center">
  <a href="http://testangular.com/?utm_source=github&utm_medium=link&utm_campaign=observer-spy">
    <img src="for-readme/test-angular.jpg"
      alt="TestAngular.com - Free Angular Testing Workshop - The Roadmap to Angular Testing Mastery"
      width="600"
    />
  </a>
</div>

## What's the problem?

Testing RxJS observables is usually hard, especially when testing advanced use cases.

This library:

✅ **Is easy to understand**

✅ **Reduces the complexity**

✅ **Makes testing advanced observables easy**

## Installation

```
yarn add -D @hirez_io/observer-spy
```

or

```
npm install -D @hirez_io/observer-spy
```

## Why not marble testing?

[Marble tests](https://rxjs-dev.firebaseapp.com/guide/testing/internal-marble-tests) are very powerful, but at the same time very complicated to learn and to reason about (IMO).

You need to learn and understand `cold` and `hot` observables, `schedulers` and to learn a new syntax just to test a simple observable chain.

More complex observable chains tests get even harder to read.

That's why this library was created - to present another alternative to marble tests, which I believe is cleaner and easier to understand and to implement.

### How observer spies are cleaner?

You generally want to test the outcome of your action, not implementation details like exactly how many frames were between each value.

The order of recieved values represents the desired outcome for most production app use cases.

Most of the time, if enough (virtual) time passes until the expectation in my test, it should be sufficient to prove whether the expected outcome is valid or not.

## Usage

#### `new ObserverSpy()`

In order to test observables, you can use an `ObserverSpy` instance to "record" all the messages a source observable emits and to get them as an array.

You can also spy on the `error` or `complete` states of the observer.

You can use `done` or `async` / `await` to wait for `onComplete` to be called as well.

**Example:**

```js
// ... other imports
import { ObserverSpy } from '@hirez_io/observer-spy';

it('should spy on Observable values', () => {
  const observerSpy = new ObserverSpy();
  // BTW, if you're using TypeScript you can declare it with a generic:
  // const observerSpy: ObserverSpy<string> = new ObserverSpy();

  const fakeValues = ['first', 'second', 'third'];
  const fakeObservable = of(...fakeValues);

  const subscription = fakeObservable.subscribe(observerSpy);

  // DO SOME LOGIC HERE

  // unsubscribing is optional, it's good for stopping intervals etc
  subscription.unsubscribe();

  expect(observerSpy.receivedNext()).toBe(true);

  expect(observerSpy.getValues()).toEqual(fakeValues);

  expect(observerSpy.getValuesLength()).toEqual(3);

  expect(observerSpy.getFirstValue()).toEqual('first');

  expect(observerSpy.getValueAt(1)).toEqual('second');

  expect(observerSpy.getLastValue()).toEqual('third');

  expect(observerSpy.receivedComplete()).toBe(true);

  observerSpy.onComplete(() => {
    expect(observerSpy.receivedComplete()).toBe(true);
  }));
});

it('should support async await for onComplete()', async ()=>{
  const observerSpy = new ObserverSpy();
  const fakeObservable = of('first', 'second', 'third');

  fakeObservable.subscribe(observerSpy);

  await observerSpy.onComplete();

  expect(observerSpy.receivedComplete()).toBe(true);
});

it('should spy on Observable errors', () => {
  const observerSpy = new ObserverSpy();

  const fakeObservable = throwError('FAKE ERROR');

  fakeObservable.subscribe(observerSpy);

  expect(observerSpy.receivedError()).toBe(true);

  expect(observerSpy.getError()).toEqual('FAKE ERROR');
});
```

# Testing Async Observables

#### `it('should do something', fakeTime((flush) => { ... flush(); });`

You can use the `fakeTime` utility function and call `flush()` to simulate the passage of time if you have any async operators like `delay` or `timeout` in your tests.

### [SEE AN EXAMPLE HERE](#-for-time-based-rxjs-code-timeouts--intervals--animations---use-faketime)

---

## Now, let's see some use cases and their solutions:

### ▶ For _Angular_ code - just use `fakeAsync`

You can control time in a much more versatile way and clear the microtasks queue (for promises) without using the `done()` which is much more convenient.

Just use `fakeAsync` (and `tick` if you need it).

Example:

```js
// ... other imports
import { ObserverSpy } from '@hirez_io/observer-spy';
import { fakeAsync, tick } from '@angular/core/testing';

it('should test Angular code with delay', fakeAsync(() => {
  const observerSpy = new ObserverSpy();

  const fakeObservable = of('fake value').pipe(delay(1000));

  const sub = fakeObservable.subscribe(observerSpy);

  tick(1000);

  sub.unsubscribe();

  expect(observerSpy.getLastValue()).toEqual('fake value');
}));
```

### ▶ For microtasks related code (promises, but no timeouts / intervals) - just use `async` `await` or `done()`

You can use the `onComplete` method to wait for a completion before checking the outcome.
Chose between `async` + `await` or `done`, both work.

Example:

```js
// ... other imports
import { ObserverSpy } from '@hirez_io/observer-spy';

it('should work with observables', async () => {
  const observerSpy: ObserverSpy<string> = new ObserverSpy();

  const fakeService = {
    getData() {
      return defer(() => of('fake data'));
    },
  };
  const fakeObservable = of('').pipe(switchMap(() => fakeService.getData()));

  fakeObservable.subscribe(observerSpy);

  await observerSpy.onComplete();

  expect(observerSpy.getLastValue()).toEqual('fake data');
});

it('should work with promises', async () => {
  const observerSpy: ObserverSpy<string> = new ObserverSpy();

  const fakeService = {
    getData() {
      return Promise.resolve('fake data');
    },
  };
  const fakeObservable = defer(() => fakeService.getData());

  fakeObservable.subscribe(observerSpy);

  await observerSpy.onComplete();

  expect(observerSpy.getLastValue()).toEqual('fake data');
});

it('should work with promises and "done()"', (done) => {
  const observerSpy: ObserverSpy<string> = new ObserverSpy();

  const fakeService = {
    getData() {
      return Promise.resolve('fake data');
    },
  };
  const fakeObservable = defer(() => fakeService.getData());

  fakeObservable.subscribe(observerSpy);

  observerSpy.onComplete(() => {
    expect(observerSpy.getLastValue()).toEqual('fake data');
    done();
  });
});
```

### ▶ For _time based_ rxjs code (timeouts / intervals / animations) - use `fakeTime`

`fakeTime` is a utility function that wraps the test callback.

It does the following things:

1. Changes the `AsyncScheduler` delegate to use `VirtualTimeScheduler` (which gives you the ability to use "virtual time" instead of having long tests)
2. Passes a `flush` function you can call to `flush()` the virtual time (pass time forward)
3. Works well with `done` if you pass it as the second parameter (instead of the first)

Example:

```js
// ... other imports
import { ObserverSpy, fakeTime } from '@hirez_io/observer-spy';

it(
  'should handle delays with a virtual scheduler',
  fakeTime((flush) => {
    const VALUES = ['first', 'second', 'third'];
    const observerSpy: ObserverSpy<string> = new ObserverSpy();
    const delayedObservable: Observable<string> = of(...VALUES).pipe(delay(20000));

    const sub = delayedObservable.subscribe(observerSpy);
    flush();
    sub.unsubscribe();

    expect(observerSpy.getValues()).toEqual(VALUES);
  })
);

it(
  'should handle be able to deal with done functionality as well',
  fakeTime((flush, done) => {
    const VALUES = ['first', 'second', 'third'];
    const observerSpy: ObserverSpy<string> = new ObserverSpy();
    const delayedObservable: Observable<string> = of(...VALUES).pipe(delay(20000));

    const sub = delayedObservable.subscribe(observerSpy);
    flush();
    sub.unsubscribe();

    observerSpy.onComplete(() => {
      expect(observerSpy.getValues()).toEqual(VALUES);
      done();
    });
  })
);
```

### ▶ For _ajax_ calls (http) - they shouldn't be tested in a unit / micro test anyway... 😜

Yeah. Test those in an integration test!

# Wanna learn more?

## In my [class testing In action course](http://testangular.com/?utm_source=github&utm_medium=link&utm_campaign=observer-spy) I go over all the differences and show you how to use this library to test stuff like `switchMap`, `interval` etc...

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="http://www.hirez.io/"><img src="https://avatars1.githubusercontent.com/u/1430726?v=4" width="100px;" alt=""/><br /><sub><b>Shai Reznik</b></sub></a><br /><a href="https://github.com/hirezio/observer-spy/commits?author=shairez" title="Code">💻</a> <a href="https://github.com/hirezio/observer-spy/commits?author=shairez" title="Tests">⚠️</a> <a href="#infra-shairez" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/hirezio/observer-spy/commits?author=shairez" title="Documentation">📖</a> <a href="#maintenance-shairez" title="Maintenance">🚧</a> <a href="https://github.com/hirezio/observer-spy/pulls?q=is%3Apr+reviewed-by%3Ashairez" title="Reviewed Pull Requests">👀</a> <a href="#ideas-shairez" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://www.codamit.dev"><img src="https://avatars0.githubusercontent.com/u/8522558?v=4" width="100px;" alt=""/><br /><sub><b>Edouard Bozon</b></sub></a><br /><a href="https://github.com/hirezio/observer-spy/commits?author=edbzn" title="Code">💻</a> <a href="https://github.com/hirezio/observer-spy/commits?author=edbzn" title="Tests">⚠️</a> <a href="https://github.com/hirezio/observer-spy/commits?author=edbzn" title="Documentation">📖</a> <a href="#ideas-edbzn" title="Ideas, Planning, & Feedback">🤔</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
