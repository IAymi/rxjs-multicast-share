// Import stylesheets
import './style.css';

// Write TypeScript code!
const appDiv: HTMLElement = document.getElementById('app');
appDiv.innerHTML = `<h1>TypeScript Starter</h1>`;

// setting for look like rxjs
console.clear();

interface Observer {
  next: (value: any) => void;
  error: (err: any) => void;
  complete: () => void;
}

type TearDown = () => void;

type OperatorFunction = (source: Observable) => Observable;

class Subscription {
  teardownList: TearDown[] = [];
  constructor(teardown?: TearDown) {
    if (teardown) {
      this.teardownList.push(teardown);
    }
  }

  add(subscription: Subscription) {
    this.teardownList.push(() => subscription.unsubscribe());
  }

  unsubscribe() {
    this.teardownList.forEach((teardown) => teardown());
    this.teardownList = [];
  }
}

class Observable {
  pipe(this: Observable, ...operators: OperatorFunction[]) {
    let source = this;
    operators.forEach((operator) => {
      source = operator(source);
    });
    return source;
  }

  subscriber: (observer: Observer) => TearDown;
  constructor(subscriber: (observer: Observer) => TearDown) {
    this.subscriber = subscriber;
  }

  subscribe(observer: Observer) {
    const teardown: TearDown = this.subscriber(observer);
    const subscription = new Subscription(teardown);
    return subscription;
  }
}

const observer: Observer = {
  next: (value: any) => console.log('observer next', value),
  error: (err: any) => console.log('observer error', err),
  complete: () => console.log('observer complete'),
};

class Subject implements Observer {
  private observers: Observer[] = [];

  next(value: any) {
    this.observers.forEach((observer) => observer.next(value));
  }
  error(err: any) {
    this.observers.forEach((observer) => observer.error(err));
  }
  complete() {
    this.observers.forEach((observer) => observer.complete());
  }

  pipe(this: Observable, ...operators: OperatorFunction[]) {
    let source = this;
    operators.forEach((operator) => {
      source = operator(source);
    });
    return source;
  }

  subscribe(observer: Observer) {
    console.log('subscribe!!');
    this.observers.push(observer);
    const teardown: TearDown = () => {
      const index = this.observers.findIndex((b) => b === observer);
      if (index > -1) {
        this.observers.splice(index, 1);
      }
    };

    const subscription = new Subscription(teardown);
    return subscription;
  }
}

// Start coding

import { interval } from 'rxjs';

const observer1: Observer = {
  next: (value: any) => console.log('observer1 next', value),
  error: (err: any) => console.log('observer1 error', err),
  complete: () => console.log('observer1 complete'),
};

const observer2: Observer = {
  next: (value: any) => console.log('observer2 next', value),
  error: (err: any) => console.log('observer2 error', err),
  complete: () => console.log('observer2 complete'),
};

const observer3: Observer = {
  next: (value: any) => console.log('observer3 next', value),
  error: (err: any) => console.log('observer3 error', err),
  complete: () => console.log('observer3 complete'),
};

const source = interval(1000);
const subject = new Subject();
source.subscribe(subject);
subject.subscribe(observer1);
subject.subscribe(observer2);

setTimeout(() => {
  subject.subscribe(observer3);
}, 5000);
