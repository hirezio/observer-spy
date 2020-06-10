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
