import { Observer } from 'rxjs';

export class ObserverSpy<T> implements Observer<T> {
  private onNextValues: T[] = [];

  private observerState = {
    onNextCalled: false,
    onErrorCalled: false,
    onCompleteCalled: false,
    errorValue: undefined,
  };

  next(value: T): void {
    this.onNextValues.push(value);
    this.observerState.onNextCalled = true;
  }

  error(errorVal: any): void {
    this.observerState.errorValue = errorVal;
    this.observerState.onErrorCalled = true;
  }

  complete(): void {
    this.observerState.onCompleteCalled = true;
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
    return this.observerState.onNextCalled;
  }

  getError(): any {
    return this.observerState.errorValue;
  }

  receivedError(): boolean {
    return this.observerState.onErrorCalled;
  }

  receivedComplete(): boolean {
    return this.observerState.onCompleteCalled;
  }
}
