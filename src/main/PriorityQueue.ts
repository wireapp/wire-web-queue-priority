import Priority from './Priority';
import QueueObject from './QueueObject';

export default class PriorityQueue<P, T> {
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
    if (!queueObject) {
      return;
    }

    Promise.resolve(queueObject.fn())
      .then((result: P) => {
        queueObject.resolve(result);
        return true;
      })
      .catch((error: Error) => {
        if (queueObject.retry > 0) {
          queueObject.retry -= 1;
          // TODO: Implement configurable reconnection delay (and reconnection delay growth factor)
          setTimeout(() => this.resolveItems(), 1000);
          return false;
        } else {
          queueObject.reject(error);
          return true;
        }
      })
      .then((shouldContinue: boolean) => {
        if (shouldContinue) {
          this.isPending = false;
          const unshifted: QueueObject<P> = this.queue.shift();
          if (unshifted) {
            this.resolveItems();
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
