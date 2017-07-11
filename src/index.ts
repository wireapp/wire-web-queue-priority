'use strict';

export enum Priority {
  LOW = 0,
  MEDIUM = 5,
  HIGH = 9,
};

export class QueueObject<I, P> {
  item: I;
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
    const {item = null} = this.queue[0];
    return item;
  }

  public get last(): I {
    const {item = null} = this.queue[this.queue.length - 1];
    return item;
  }

  private run(): void {
    if (!this.isPending) {
      const item = this.first;
      this.isPending = true;
      if (item) {
        const queueItem = this.queue.shift();
        Promise.resolve(queueItem.item).then(() => {
          this.isPending = false;
          return this.run();
        });
      } else {
        Promise.resolve();
      }
    }
  }

  public add(item: I, priority: P = <any>Priority.MEDIUM): void {
    this.queue.push({item, priority});
    this.queue.sort(this.comparator);
  }

  public getAll(): Array<QueueObject<I, P>> {
    return this.queue;
  }
}
