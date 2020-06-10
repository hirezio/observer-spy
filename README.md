# @hirez_io/observer-spy 👀💪

A simple little class that helps making Observable testing a breeze

[![npm version](https://img.shields.io/npm/v/@hirez_io/observer-spy.svg?style=flat-square)](https://www.npmjs.org/package/@hirez_io/observer-spy)
[![npm downloads](https://img.shields.io/npm/dm/@hirez_io/observer-spy.svg?style=flat-square)](http://npm-stat.com/charts.html?package=@hirez_io/observer-spy&from=2017-07-26)
[![Build Status](https://travis-ci.org/hirezio/observer-spy.svg?branch=master)](https://travis-ci.org/hirezio/observer-spy)
[![codecov](https://img.shields.io/codecov/c/github/hirezio/observer-spy.svg)](https://codecov.io/gh/hirezio/observer-spy)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

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

✅ **Easy to understand**

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

## Usage

#### `new ObserverSpy()`

In order to test observables, you can use an `ObserverSpy` instance to "record" all the messages a source observable emits and to get them as an array.

You can also spy on the `error` or `complete` states of the observer.

**Example:**

```js
// ... other imports
import { ObserverSpy } from '@hirez_io/observer-spy';

it('should spy on Observable values', () => {
  const observerSpy = new ObserverSpy();
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

it('should spy on Observable errors', () => {
  const observerSpy = new ObserverSpy();

  const fakeObservable = throwError('FAKE ERROR');

  fakeObservable.subscribe(observerSpy);

  expect(observerSpy.receivedError()).toBe(true);

  expect(observerSpy.getError()).toEqual('FAKE ERROR');
});
```

# Testing Async Observables

### ▶ For _Angular_ code - just use `fakeAsync`

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

### ▶ For only _promises_ (no timeouts / intervals) - just use `done`

You don't even need to use an observer spy

Example:

```js
// ... other imports
import { ObserverSpy } from '@hirez_io/observer-spy';

it('should work with promises', (done) => {
  const observerSpy: ObserverSpy<string> = new ObserverSpy();

  const fakeService = {
    getData() {
      return Promise.resolve('fake data');
    },
  };
  const fakeObservable = of('').pipe(switchMap(() => fakeService.getData()));

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

1. Changes the `AsyncScheduler` delegate to use `VirtualTimeScheduler` (which gives you the ability to use "virtual time" instead of having long tests.
2. Passes a `flush` function you can call to `flush()` when you want to virtually pass time forward.
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

### ▶ For _ajax_ calls (http) - they shouldn't be tested in a unit / micro test... 😜

Yeah. Test those in an integration test

## Wanna learn more?

In my [class testing In action course](http://testangular.com/?utm_source=github&utm_medium=link&utm_campaign=observer-spy) I go over all the differences and show you how to use this library to test stuff like `switchMap`, `interval` etc...
