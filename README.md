# @hirez_io/observer-spy

[![npm version](https://img.shields.io/npm/v/@hirez_io/observer-spy.svg?style=flat-square)](https://www.npmjs.org/package/@hirez_io/observer-spy)
[![npm downloads](https://img.shields.io/npm/dm/@hirez_io/observer-spy.svg?style=flat-square)](http://npm-stat.com/charts.html?package=@hirez_io/observer-spy&from=2017-07-26)
[![Build Status](https://travis-ci.org/hirezio/observer-spy.svg?branch=master)](https://travis-ci.org/hirezio/observer-spy)
[![codecov](https://img.shields.io/codecov/c/github/hirezio/observer-spy.svg)](https://codecov.io/gh/hirezio/observer-spy)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

## Installation

```
npm install -D @hirez_io/observer-spy
```

or

```
yarn add -D @hirez_io/observer-spy
```

<br/>

## Challenges

Testing RxJS observables is unusually hard, especially when testing advanced use cases. This library:

- Makes it **easy** to understand
- **Reduces** the complexity
- Makes **testing** advanced observables easy

[Marble tests](https://rxjs-dev.firebaseapp.com/guide/testing/internal-marble-tests) offer very powerful testing solutions. Unfortunately marble tests are conceptually very complicated to learn and to reason about. Marble tests <u>are not suitable</u> for day-to-day testing within most developer testing.

Why are Marble Tests difficult?

You need to learn and understand `cold` and `hot` observables, `schedulers` and to learn a new syntax just to test a simple observable chain. More complex observable chains tests gets even harder to read.

## Solution

The **Observer-Spy** library was created to present a viable alternative to Marble Tests. An _alternative_ that is cleaner, easier to understand, and super-easy to use. **Observer-Spy** makes RxJS testing easy! 👀💪

Why are Observer **Spy(s)** better?

You generally want to test the <u>outcome of your action</u> instead of implementation details [like how many frames were between each value].

For most production apps use cases, testing the **received values** is the requirement. Most of the time, `it()` should be sufficient to prove whether the expected RxJS stream outcome is valid or not.

<br/>

## Usage

<br/>

#### `spyOn()`

In order to test observables, you can use the `spyOn(<observable>, completionCallback)` function to auto-subscribe to the stream and "record" all the values that stream observable emits. `spyOn()` even returns a `dispose` function to easily unsubscribe from the stream.

> You can also spy on the `error` or `complete` states of the observer.

```ts
  const [spy, dispose] = spyOn(<observable>);
```

#### Using `SpyUtils`

```ts
afterEach(() => {
  SpyUtils.disposeAll();
});
```

Now developers can easily batch unsubscribe all spys in their tests: using `SpyUtils.disposeAll()`.

<br/>

##### **Example:**

```js
import { Observable, from } from 'rxjs';
import { spyOn, SpyUtils } from '@hirez_io/observer-spy';

describe('Using spyOn() features', () => {
  afterEach(() => SpyUtils.disposeAll()); // unsubscribe all spys

  it('should spy on Observable values', () => {
    const list = ['1st', '2nd', '3rd'];
    const source$: Observable<string> = from(list);
    const optionalCallback = (spy1) => {
      expect(spy1.state.called.complete).toBe(true);
    };
    const [spy, dispose, , values] = spyOn(source$, optionalCallback);

    expect(spy.values).toEqual(list);
    expect(spy.values.length).toEqual(list.length);

    expect(spy.readFirst()).toEqual('1st');
    expect(spy.values(1)).toEqual(list[1]);
    expect(spy.readLast()).toEqual('3rd');

    expect(spy.state.called.next).toBe(true);
    expect(spy.state.called.complete).toBe(true);

    dispose(); // can directly dispose of spy connection
  });

  it('should spy on Observable errors', () => {
    const stream$ = throwError('FAKE ERROR');
    const [spy] = spyOn(stream$);

    expect(spy.state.called.error).toBe(true);
    expect(spy.state.errorValue).toEqual('FAKE ERROR');
  });
});
```

<br/>
<br/>

# Testing Sync Logic

### ▶ Synchronous RxJS

RxJS - without delaying operators or async execution contexts - will run synchronously. This is the simplest use case; where our `it()` does not need any special asynchronous plugins.

```ts
it('should set `called.next` to true', () => {
  const [spy, disconnect] = spyOn(from(['first', 'second', 'third']));
  expect(spy.values.length).toBe(3);
});
```

<br/>
<br/>

# Testing Async Logic

General Rules:

- If you are using Promise(s), just use the test callback `done()`.
- If you are using any RxJS operators like `delay` or `timeout` in your tests, you should use the `fakeTime` utility function and call `flush()` to simulate the passage of time;

[![image](https://user-images.githubusercontent.com/210413/85336618-83f92180-b4a4-11ea-800d-6bb275eeda45.png)](#-for-time-based-rxjs-code-timeouts--intervals--animations---use-faketime)

<br/>

### ▶ Async Promises

Since Promise(s) are [MicroTasks](https://javascript.info/microtask-queue), we should consider them to resolve asynchronously.

For code using either _Promise(s)_ **without timeouts or intervals**, just use `it('should ....', (done) => {});`.

Developers will call the `done()` function inside the optional `onComplete()` callback option in the `spyOn(<observable>, <callback>)` function:

```ts
// ... other imports
import { spyOn } from '@hirez_io/observer-spy';

it('should work with promises', (done) => {
  const EVENT = 'fake data';
  const fakeService = { getData: () => Promise.resolve(EVENT) };
  const http$ = of('').pipe(switchMap(() => fakeService.getData()));

  spyOn(http$, (spy) => {
    expect(spy.readLast()).toEqual(EVENT);
    done();
  });
});
```

### ▶ Async RxJS code

RxJS code that has time-based logic (e.g using timeouts / intervals / animations) will emit asynchronously. And RxJS streams constructed from HTTP REST calls will emit asynchronously. `fakeTime()` is a a custom utility function perfect for most of these use-cases.

`fakeTime()` does the following things:

1. Changes the RxJS `AsyncScheduler` delegate to use `VirtualTimeScheduler` and use "virtual time".
2. Passes a `flush` function you can call to `flush()` when you want to virtually pass time forward.
3. Works well with `done` if you pass it as the second parameter (instead of the first)

Now - with our virtual time =- your tests are easy:

```ts
import { from } from 'rxjs';
import { spyOn, SpyUtils, fakeTime } from '@hirez_io/observer-spy';

describe('spyOn with fakeTime', () => {
  afterEach(() => SpyUtils.disposeAll());

  it(
    'should handle delays with a virtual scheduler',
    fakeTime((flush) => {
      const VALUES = ['first', 'second', 'third'];
      const delayed$ = from(VALUES).pipe(delay(20000));
      const [spy] = spyOn(delayed$);

      flush();

      expect(spy.values).toEqual(VALUES);
    })
  );

  it(
    'should handle `done()` functionality as well',
    fakeTime((flush, done) => {
      const VALUES = ['first', 'second', 'third'];
      const delayed$ = from(VALUES).pipe(delay(20000));
      const [spy1] = spyOn(delayed$, (spy) => {
        expect(spy1.values).toEqual(spy.values);
        done();
      });

      flush();
    })
  );
});
```

### ▶ Async RxJS code + _Angular_

With Angular, you can control time in a much more versatile way. Just use `fakeAsync` (and `tick` if you need it):

```ts
// ... other imports
import { spyOn } from '@hirez_io/observer-spy';
import { fakeAsync, tick } from '@angular/core/testing';

it('should test Angular code with delay', fakeAsync(() => {
  const EVENT = 'fake value';
  const delayed$ = of(EVENT).pipe(delay(1000));
  const [spy, dispose] = spyOn(delayed$);

  tick(1000);
  dispose();

  expect(spy.readLast()).toEqual(EVENT);
}));
```

### ▶ For _AJAX_ calls

Asynchronous REST calls (using axios, http, fetch, etc.) should not be tested in a unit / micro test... Test those in an integration test! 😜

<br/>

## Wanna learn more?

In the online course ["Testing In Action"](http://testangular.com/?utm_source=github&utm_medium=link&utm_campaign=observer-spy), @shai_reznik will go over all the differences and show you how to use this library to test stuff like `switchMap`, `interval` etc...

<br/>

<div align="center">
  <a href="http://testangular.com/?utm_source=github&utm_medium=link&utm_campaign=observer-spy">
    <img src="for-readme/test-angular.jpg" href="http://testangular.com/?utm_source=github&utm_medium=link&utm_campaign=observer-spy"
      alt="TestAngular.com - Free Angular Testing Workshop - The Roadmap to Angular Testing Mastery"
      width="600"
    />
  </a>
</div>

<br/>
