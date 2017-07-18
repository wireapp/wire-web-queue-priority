'use strict';

export enum Priority {
  LOW = 0,
  MEDIUM = 5,
  HIGH = 9,
}

export class QueueObject<P, T> {
  fn: Promise<T>;
  priority: P;
  timestamp: Date;
}

export class PriorityQueue<P, T> {
  private comparator: (a: QueueObject<P, T>, b: QueueObject<P, T>) => number;
  private isPending: boolean = false;
  private queue: Array<QueueObject<P, T>> = [];

  constructor(comparator?: (a: QueueObject<P, T>, b: QueueObject<P, T>) => number) {
    if (typeof comparator === 'function') {
      this.comparator = comparator;
    } else {
      this.comparator = (a: QueueObject<P, T>, b: QueueObject<P, T>): number => {
        if (a.priority === b.priority) {
          return b.timestamp.getTime() - a.timestamp.getTime();
        }
        return <any>b.priority - <any>a.priority;
      };
    }
  }

  public add(fn: Promise<T>, priority: P = <any>Priority.MEDIUM): void {
    if (fn.constructor.name !== 'Promise') {
      const value = fn;
      if (typeof value === 'function') {
        fn = new Promise((resolve) => resolve(value()));
      } else {
        fn = new Promise((resolve) => resolve(value));
      }
    }

    this.queue.push({fn, priority, timestamp: new Date()});
    this.queue.sort(this.comparator);
    this.run();
  }

  public get size(): number {
    return this.queue.length;
  }

  public get first(): QueueObject<P, T> {
    return this.queue[0];
  }

  public get last(): QueueObject<P, T> {
    return this.queue[this.queue.length - 1];
  }

  private resolveItems(): void {
    const {fn} = this.first;

    fn.then(() => {
      this.queue.shift();
      this.isPending = false;
      this.run();
    }).catch(() => {
      // TODO: Implement configurable reconnection delay (and reconnection delay growth factor)
      setTimeout(() => this.resolveItems(), 1000);
    });
  }

  private run(): void {
    if (!this.isPending && this.first) {
      this.isPending = true;
      this.resolveItems();
    }
  }
}
