'use strict';

export enum Priority {
  LOW = 0,
  MEDIUM = 5,
  HIGH = 9,
}

export class QueueObject<P> {
  fn: Function;
  priority: P;
  timestamp: Date;
}

export class PriorityQueue<P> {
  private comparator: (a: QueueObject<P>, b: QueueObject<P>) => number;
  private isPending: boolean = false;
  private queue: Array<QueueObject<P>> = [];

  constructor(comparator?: (a: QueueObject<P>, b: QueueObject<P>) => number) {
    if (typeof comparator === 'function') {
      this.comparator = comparator;
    } else {
      this.comparator = (a: QueueObject<P>, b: QueueObject<P>): number => {
        if (a.priority === b.priority) {
          return <any>b.timestamp - <any>a.timestamp;
        }
        return <any>b.priority - <any>a.priority;
      };
    }
  }

  public add(fn: Function, priority: P = <any>Priority.MEDIUM): void {
    const timestamp = new Date();

    this.queue.push({fn, priority, timestamp});
    this.queue.sort(this.comparator);
    this.run();
  }

  public get size(): number {
    return this.queue.length;
  }

  public get first(): QueueObject<P> {
    return this.queue[0];
  }

  public get last(): QueueObject<P> {
    return this.queue[this.queue.length - 1];
  }

  private run(): void {
    if (!this.isPending && this.first) {
      const {fn} = this.first;

      this.isPending = true;
      Promise.resolve(fn())
        .then(() => {
          this.queue.shift();
          this.isPending = false;
          this.run();
        }).catch(() => {
          this.queue.shift();
          this.isPending = false;
          this.run();
        });
    }
  }
}
