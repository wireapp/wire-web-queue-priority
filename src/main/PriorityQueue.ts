import Config from './Config';
import Item from './Item';
import Priority from './Priority';

export default class PriorityQueue<P> {
  private config: Config<P>;
  private defaults = {
    comparator: (a: Item<number>, b: Item<number>): number => {
      if (a.priority === b.priority) return a.timestamp - b.timestamp;
      return b.priority - a.priority;
    },
    maxRetries: Infinity,
    retryDelay: 1000
  };
  private isPending: boolean = false;
  private queue: Array<Item<P>> = [];

  constructor(config?: Config<P>) {
    this.config = Object.assign(this.defaults, config);
  }

  public add(thunkedPromise: Function, priority: P = <any>Priority.MEDIUM): Promise<any> {
    if (typeof thunkedPromise !== 'function') thunkedPromise = () => thunkedPromise;

    return new Promise((resolve, reject) => {
      console.log('ADDDDD!', thunkedPromise.toString());
      const queueObject = new Item<P>();
      queueObject.fn = thunkedPromise;
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

  public get first(): Item<P> {
    return this.queue[0];
  }

  public get last(): Item<P> {
    return this.queue[this.queue.length - 1];
  }

  public toString() {
    let string = '';

    for (const index in this.queue) {
      const item = this.queue[index];
      string += `"${index}": ${item.fn.toString()}\r\n`;
    }

    return string;
  }

  private resolveItems(): void {
    console.log("QUEUE", this.toString());
    const queueObject = this.first;
    if (!queueObject) {
      console.log('WIR SIND AM ENDE!');
      return;
    }

    Promise.resolve(queueObject.fn())
      .then((result: any) => {
        return [true, () => queueObject.resolve(result)];
      })
      .catch((error: Error) => {
        if (queueObject.retry > 0) {
          queueObject.retry -= 1;
          // TODO: Implement configurable reconnection delay (and reconnection delay growth factor)
          setTimeout(() => this.resolveItems(), this.config.retryDelay);
          return [false];
        } else {
          console.log('STOOOOOOOPPPP');
          queueObject.reject(error);
          return [true];
        }
      })
      .then(([shouldContinue, wrappedResolve]: [boolean, () => any]) => {
        if (shouldContinue) {
          console.log('CONTINUE!!!');
          if (wrappedResolve) wrappedResolve();
          this.isPending = false;
          const nextItem: Item<P> = this.queue.shift();
          if (nextItem) {
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
