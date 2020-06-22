import { Observable, of, throwError, Subscription, from } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { delay } from 'rxjs/operators';

import { spyOn, SpyUtils } from './observer-spy.factory';

describe('Observer-Spy Factory', () => {
  const list = ['first', 'second', 'third'];

  describe(`build a spy on 3-value stream`, () => {
    it('should set `called.next` to true', () => {
      const [oSpy, disconnect] = spyOn<string>(from(['first', 'second', 'third']));

      disconnect();
      expect(oSpy.state.called.next).toBe(true);
    });

    it('should be able to return the correct first value', () => {
      const [oSpy, disconnect] = spyOn<string>(from(list));

      disconnect();
      expect(oSpy.readFirst()).toEqual(list[0]);
    });

    it('should be able to return the correct value at any index', () => {
      const [oSpy, disconnect] = spyOn<string>(from(list));

      disconnect();
      expect(oSpy.values[1]).toEqual(list[1]);
    });

    it('should be able to return the correct last value', () => {
      const [oSpy, disconnect] = spyOn<string>(from(list));

      disconnect();
      expect(oSpy.readLast()).toEqual(list[2]);
    });

    it('should know whether it got a "complete" notification', () => {
      const [oSpy, disconnect] = spyOn<string>(from(list));

      disconnect();
      expect(oSpy.state.called.complete).toBe(true);
    });
  });
  describe('supports subscription cleanup during `disconnect()`', () => {
    it('should detect subscriptions', () => {
      const [, disconnect] = spyOn<string>(from(list));
      const isWatching = SpyUtils.hasSpys();

      expect(isWatching).toBe(true);
      disconnect();
    });

    it('should cleanup with `disconnect()`', () => {
      const [, disconnect] = spyOn<string>(from(list));

      disconnect();

      const isWatching = SpyUtils.hasSpys();
      expect(isWatching).toBe(false);
    });
  });

  describe('supports globa subscription cleanup without `disconnect()`', () => {
    afterEach(() => {
      expect(SpyUtils.hasSpys()).toBe(true);
      SpyUtils.disposeAll();
      expect(SpyUtils.hasSpys()).toBe(false);
    });
    it('should detect subscriptions', () => {
      let completed = false;
      const onCompletion = () => (completed = true);

      spyOn<string>(from(['1st', '2nd', '3rd']));
      spyOn<string>(from(['4th', '5th', '6th']), onCompletion);

      const isWatching = SpyUtils.hasSpys();
      expect(isWatching).toBe(true);
      expect(completed).toBe(true);
    });
  });
});

function makeTestScheduler() {
  return new TestScheduler((actual, expected) => {
    expect(actual).toEqual(expected);
  });
}
