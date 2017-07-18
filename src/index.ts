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
          return b.timestamp.getTime() - a.timestamp.getTime();
        }
        return <any>b.priority - <any>a.priority;
      };
    }
  }

  public add(fn: Function, priority: P = <any>Priority.MEDIUM): void {
    this.queue.push({fn, priority, timestamp: new Date()});
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

  private resolveItems(): void {
    const {fn} = this.first;

    Promise.resolve(fn())
      .then(() => {
        this.queue.shift();
        this.isPending = false;
        this.run();
      })
      .catch(() => {
        // TODO: Implement configurable reconnection delay (and reconnection delay grow factor)
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
