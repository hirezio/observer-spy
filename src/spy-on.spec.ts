import { ObserverSpy } from './observer-spy';
import { from } from 'rxjs';
import { delay } from 'rxjs/operators';

import { spyOn, SpyUtils } from './spy-on';
import { fakeTime } from './fake-time';

describe('spy-on', () => {
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

      expect(SpyUtils.hasSpys()).toBe(true);
      disconnect();
      expect(SpyUtils.hasSpys()).toBe(false);
    });

    it('should cleanup with `disconnect()`', () => {
      const [, disconnect] = spyOn<string>(from(list));

      expect(SpyUtils.hasSpys()).toBe(true);
      disconnect();
      expect(SpyUtils.hasSpys()).toBe(false);
    });
  });

  describe('supports globa subscription cleanup without `disconnect()`', () => {
    afterEach(() => {
      expect(SpyUtils.hasSpys()).toBe(true);
      SpyUtils.disposeAll();
      expect(SpyUtils.hasSpys()).toBe(false);
    });
    it('should detect subscriptions', () => {
      let s2Completed = false;
      const onCompletion = () => (s2Completed = true);

      spyOn<string>(from(['1st', '2nd', '3rd']));
      spyOn<string>(from(['4th', '5th', '6th']), onCompletion);

      const isWatching = SpyUtils.hasSpys();
      expect(isWatching).toBe(true);
      expect(s2Completed).toBe(true);
    });
  });

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
        const [spy1] = spyOn(delayed$, (spy2: ObserverSpy<string>) => {
          expect(spy2.values).toEqual(spy1.values);
          done();
        });

        flush();
      })
    );
  });
});
