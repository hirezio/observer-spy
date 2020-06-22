import { Observer } from 'rxjs';

export interface ObserverState<T> {
  values: T[];
  called: {
    next: boolean;
    error: boolean;
    complete: boolean;
  };
  errorValue: any;
}

export type CompletionCallback = (spy: ObserverSpy<any>) => void;
const NOOP = () => {};

export class ObserverSpy<T> implements Observer<T> {
  private isLocked = false;
  private _state: ObserverState<T> = {
    values: [],
    errorValue: undefined,
    called: {
      next: false,
      error: false,
      complete: false,
    },
  };

  constructor(private onCompleteCallback: CompletionCallback = NOOP) {}

  // *************************************************
  // Observer API
  // *************************************************

  next(value: T): void {
    if (!this.isLocked) {
      this._state.values.push(value);
      this._state.called.next = true;
    }
  }

  error(errorVal: any): void {
    if (!this.isLocked) {
      this._state.errorValue = errorVal;
      this._state.called.error = true;

      this.complete();
    }
  }

  complete(): void {
    this._state.called.complete = true;
    this.onCompleteCallback(this);
  }

  // *************************************************
  // Public API
  // *************************************************

  /**
   * Publish read-only snapshot of current state
   */
  get state(): ObserverState<T> {
    return {
      ...this._state,
      values: [...this._state.values],
    };
  }

  get values(): T[] {
    return this._state.values;
  }

  get hasValues(): boolean {
    return this._state.values.length > 0;
  }

  get isComplete(): boolean {
    return this._state.called.complete;
  }

  readFirst(): T | undefined {
    return this.hasValues ? this._state.values[0] : undefined;
  }

  readLast(): T | undefined {
    return this.hasValues ? this._state.values[this._state.values.length - 1] : undefined;
  }

  /**
   * Freeze the spy from all future mutations.
   * This feature allows the Spy to be locked for future
   * inspection.
   */
  freeze(lockActive = true) {
    this.isLocked = lockActive;
  }
}
