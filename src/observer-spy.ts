import { Observer } from 'rxjs';

export interface ObserverState {
  nextWasCalled: boolean;
  errorWasCalled: boolean;
  completeWasCalled: boolean;
  errorValue: any;
  errorIsExpected: boolean;
  onCompleteCallback: ((value?: unknown) => void) | undefined;
  onErrorCallback: (() => void) | undefined;
}

export interface ObserverSpyConfig {
  expectErrors: boolean;
}

export class ObserverSpy<T> implements Observer<T> {
  private onNextValues: T[] = [];

  private state: ObserverState = {
    nextWasCalled: false,
    errorWasCalled: false,
    completeWasCalled: false,
    errorValue: undefined,
    onCompleteCallback: undefined,
    onErrorCallback: undefined,
    errorIsExpected: false,
  };

  constructor(config?: ObserverSpyConfig) {
    if (config && config.expectErrors) {
      this.expectErrors();
    }
  }

  next(value: T): void {
    this.onNextValues.push(value);
    this.state.nextWasCalled = true;
  }

  error(errorVal: any): void {
    if (!this.state.errorIsExpected) {
      throw errorVal;
    }
    this.state.errorValue = errorVal;
    this.state.errorWasCalled = true;
    if (this.state.onErrorCallback) {
      this.state.onErrorCallback();
    }
  }

  complete(): void {
    this.state.completeWasCalled = true;
    if (this.state.onCompleteCallback) {
      this.state.onCompleteCallback(undefined);
    }
  }

  onComplete(): Promise<void>;
  onComplete(callback: (value?: unknown) => void): void;
  onComplete(callback?: (value?: unknown) => void) {
    if (this.state.completeWasCalled) {
      return callback ? callback(undefined) : Promise.resolve();
    }

    if (callback) {
      this.state.onCompleteCallback = callback;
      return;
    }

    return new Promise((resolve) => {
      this.state.onCompleteCallback = resolve;
    });
  }

  onError(): Promise<void> {
    if (this.state.errorWasCalled) {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      this.state.onErrorCallback = resolve;
    });
  }

  expectErrors(): this {
    this.state.errorIsExpected = true;
    return this;
  }

  getValuesLength(): number {
    return this.onNextValues.length;
  }

  getValues(): any[] {
    return this.onNextValues;
  }

  getValueAt(index: number): T {
    return this.onNextValues[index];
  }

  getFirstValue(): T {
    return this.onNextValues[0];
  }

  getLastValue(): T | undefined {
    return this.onNextValues[this.onNextValues.length - 1];
  }

  receivedNext(): boolean {
    return this.state.nextWasCalled;
  }

  getError(): any {
    return this.state.errorValue;
  }

  receivedError(): boolean {
    return this.state.errorWasCalled;
  }

  receivedComplete(): boolean {
    return this.state.completeWasCalled;
  }
}
