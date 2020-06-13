import { Observer } from 'rxjs';

export interface ObserverState {
  nextCalled: boolean;
  errorCalled: boolean;
  completeCalled: boolean;
  errorValue: any;
  onCompleteCallback: (() => void) | undefined;
}

export class ObserverSpy<T> implements Observer<T> {
  private onNextValues: T[] = [];

  private observerState: ObserverState = {
    nextCalled: false,
    errorCalled: false,
    completeCalled: false,
    errorValue: undefined,
    onCompleteCallback: undefined,
  };

  next(value: T): void {
    this.onNextValues.push(value);
    this.observerState.nextCalled = true;
  }

  error(errorVal: any): void {
    this.observerState.errorValue = errorVal;
    this.observerState.errorCalled = true;
  }

  complete(): void {
    this.observerState.completeCalled = true;
    if (this.observerState.onCompleteCallback) {
      this.observerState.onCompleteCallback();
    }
  }

  onComplete(): Promise<void>;
  onComplete(callback: () => void): void;
  onComplete(callback?: () => void) {
    if (this.observerState.completeCalled) {
      return callback ? callback() : Promise.resolve();
    }

    if (callback) {
      this.observerState.onCompleteCallback = callback;
      return;
    }

    return new Promise((resolve) => {
      this.observerState.onCompleteCallback = resolve;
    });
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
    return this.observerState.nextCalled;
  }

  getError(): any {
    return this.observerState.errorValue;
  }

  receivedError(): boolean {
    return this.observerState.errorCalled;
  }

  receivedComplete(): boolean {
    return this.observerState.completeCalled;
  }
}
