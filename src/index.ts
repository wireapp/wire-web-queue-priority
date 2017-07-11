'use strict';

export enum Priority {
  LOW = 0,
  MEDIUM = 5,
  HIGH = 9,
};

export class QueueObject<I, P> {
  fn: Function;
  priority: P;
}

export class RunQueue<I, P> {
  private comparator: (a: QueueObject<I, P>, b: QueueObject<I, P>) => number;
  private isPending: boolean = false;
  private queue: Array<QueueObject<I, P>> = [];

  constructor(comparator?: (a: QueueObject<I, P>, b: QueueObject<I, P>) => number) {
    if (typeof comparator === 'function') {
      this.comparator = comparator;
    } else {
      this.comparator = (a: QueueObject<I, P>, b: QueueObject<I, P>): number => {
        return <any>b.priority - <any>a.priority;
      };
    }
  }

  public get size(): number {
    return this.queue.length;
  }

  public get first(): I {
    const {fn = null} = this.queue[0];
    return fn();
  }

  public get last(): I {
    const {fn = null} = this.queue[this.queue.length - 1];
    return fn();
  }

  private run(): void {
    if (!this.isPending) {
      const fn = this.first;
      this.isPending = true;
      if (fn) {
        const queueFn = this.queue.shift();
        Promise.resolve(queueFn.fn())
          .then(() => {
            this.isPending = false;
            return this.run();
          }).catch((err) => {
            console.log('caught', err);
          });
      }
    }
  }

  public add(fn: Function, priority: P = <any>Priority.MEDIUM): void {
    this.queue.push({fn, priority});
    this.queue.sort(this.comparator);
  }
}
