import Priority from './Priority';
import QueueObject from './QueueObject';

export default class PriorityQueue<P, T> {
  private config: {
    comparator?: (a: QueueObject<P>, b: QueueObject<P>) => number,
    maxRetries?: number,
    retryDelay?: number
  };
  private isPending: boolean = false;
  private queue: Array<QueueObject<P>> = [];

  constructor(config) {
    const defaults = {
      comparator: (a: QueueObject<P>, b: QueueObject<P>): number => {
        if (a.priority === b.priority) return a.timestamp - b.timestamp;
        return <any>b.priority - <any>a.priority;
      },
      maxRetries: 5,
      retryDelay: 1000
    };

    this.config = Object.assign(defaults, config);
  }

  public add(fn: Function, priority: P = <any>Priority.MEDIUM): Promise<T> {
    if (typeof fn !== 'function') fn = () => fn;

    return new Promise((resolve, reject) => {
      const queueObject = new QueueObject<P>();
      queueObject.fn = fn;
      queueObject.priority = priority;
      queueObject.reject = reject;
      queueObject.resolve = resolve;
      queueObject.retry = this.config.maxRetries;
      queueObject.timestamp = Date.now() + this.size;
      this.queue.push(queueObject);
      this.queue.sort(this.config.comparator);
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
        return [true, () => queueObject.resolve(result)];
      })
      .catch((error: Error) => {
        if (queueObject.retry > 0) {
          queueObject.retry -= 1;
          // TODO: Implement configurable reconnection delay (and reconnection delay growth factor)
          setTimeout(() => this.resolveItems(), this.config.retryDelay);
          return [false];
        } else {
          queueObject.reject(error);
          return [true];
        }
      })
      .then(([shouldContinue, wrappedResolve]: [boolean, () => any]) => {
        if (shouldContinue) {
          if (wrappedResolve) wrappedResolve();
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
