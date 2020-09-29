import { Observer } from 'rxjs';

export interface ObserverState {
  nextWasCalled: boolean;
  errorWasCalled: boolean;
  completeWasCalled: boolean;
  errorValue: any;
  errorIsExpected: boolean;
  onCompleteCallback: (() => void) | undefined;
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
  }

  complete(): void {
    this.state.completeWasCalled = true;
    if (this.state.onCompleteCallback) {
      this.state.onCompleteCallback();
    }
  }

  onComplete(): Promise<void>;
  onComplete(callback: () => void): void;
  onComplete(callback?: () => void) {
    if (this.state.completeWasCalled) {
      return callback ? callback() : Promise.resolve();
    }

    if (callback) {
      this.state.onCompleteCallback = callback;
      return;
    }

    return new Promise((resolve) => {
      this.state.onCompleteCallback = resolve;
    });
  }

  expectErrors() {
    this.state.errorIsExpected = true;
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
