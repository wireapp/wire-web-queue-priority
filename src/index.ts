'use strict';

export enum Priority {
  LOW = 0,
  MEDIUM = 5,
  HIGH = 9,
}

export class QueueObject<P> {
  fn: Function;
  priority: P;
  reject: Function;
  resolve: Function;
  timestamp: Date;
  retry: number;
}

export class PriorityQueue<P, T> {
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

  public add(fn: Function, priority: P = <any>Priority.MEDIUM): Promise<T> {
    if (typeof fn !== 'function') {
      fn = () => fn;
    }

    console.log('ADDED', fn.toString());

    return new Promise((resolve, reject) => {
      const queueObject = new QueueObject<P>();
      queueObject.fn = fn;
      queueObject.timestamp = new Date();
      queueObject.priority = priority;
      queueObject.resolve = resolve;
      queueObject.reject = reject;
      queueObject.retry = 10;
      this.queue.push(queueObject);
      this.queue.sort(this.comparator);
      this.run();
    });
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
  const queueObject = this.first;
  console.log('IN PROGRESS', queueObject.fn.toString());

  Promise.resolve(queueObject.fn())
    .then((result: P) => {
      console.log('FINISHED', result);
      queueObject.resolve(result);
      const unshuffled: QueueObject<P> = this.queue.shift();
      console.log('NEXT', unshuffled.fn.toString());
      console.log('ITEMS LEFT', this.size);
      this.isPending = false;
      this.run();
    })
    .catch((error: Error) => {
      console.log('RETRY', queueObject.retry);
      if (queueObject.retry > 0) {
        queueObject.retry -= 1;
        // TODO: Implement configurable reconnection delay (and reconnection delay growth factor)
        setTimeout(() => this.resolveItems(), 1000);
      } else {
        queueObject.reject(error);
      }
    });
}

  private run(): void {
    if (!this.isPending && this.first) {
      this.isPending = true;
      this.resolveItems();
    }
  }
}
