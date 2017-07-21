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
  timestamp: number;
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
          return a.timestamp - b.timestamp;
        }
        return <any>b.priority - <any>a.priority;
      };
    }
  }

  public add(fn: Function, priority: P = <any>Priority.MEDIUM): Promise<T> {
    if (typeof fn !== 'function') {
      fn = () => fn;
    }

    console.log('ADDED', fn.toString(), this.queue.map((item) => item.fn.toString()));

    return new Promise((resolve, reject) => {
      const queueObject = new QueueObject<P>();
      queueObject.fn = fn;
      queueObject.timestamp = Date.now() + this.size;
      queueObject.priority = priority;
      queueObject.resolve = resolve;
      queueObject.reject = reject;
      queueObject.retry = 5;
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
    console.log('IN PROGRESS', queueObject.fn.toString(), this.queue.map((item) => item.fn.toString()));

    Promise.resolve(queueObject.fn())
      .then((result: P) => {
        console.log('FINISHED', result);
        queueObject.resolve(result);
        this.isPending = false;
        const unshifted: QueueObject<P> = this.queue.shift();
        console.log('ITEMS LEFT', this.size);
        if(unshifted) {
          console.log('NEXT', unshifted.fn.toString());
          this.run();
        }
      })
      .catch((error: Error) => {
      debugger;
        console.log('ERROR', error);
        console.log('RETRY', queueObject.retry, queueObject.fn.toString());
        if (queueObject.retry > 0) {
          queueObject.retry -= 1;
          // TODO: Implement configurable reconnection delay (and reconnection delay growth factor)
          setTimeout(() => this.resolveItems(), 1000);
        } else {
          console.log('ADIOS');
          queueObject.reject(error);
          this.isPending = false;
          const unshifted: QueueObject<P> = this.queue.shift();
          if(unshifted) {
            this.run();
          }
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
