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
  private queue: Array<QueueObject<I, P>> = [];
  private comparator: (a: QueueObject<I, P>, b: QueueObject<I, P>) => number;
  private isPending: boolean = false;

  constructor(comparator?: (a: QueueObject<I, P>, b: QueueObject<I, P>) => number) {
    if (comparator) {
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
    return this.queue[0].item;
  }

  public get last(): I {
    return this.queue[this.queue.length - 1].item;
  }

  public add(item: I, priority: P = <any>Priority.MEDIUM): void {
    this.queue.push({item, priority});
    this.queue.sort(this.comparator);
  }

  public getAll(): Array<QueueObject<I, P>> {
    return this.queue;
  }
}
