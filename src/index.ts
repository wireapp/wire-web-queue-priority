'use strict';

export enum Priority {
  LOW = 0,
  MEDIUM = 5,
  HIGH = 9,
};

export class QueueObject<T> {
  obj: T;
  priority: Priority;
}

export class RunQueue<T> {
  private queue: Array<QueueObject<T>> = [];

  constructor(comparator?: Function) {

  }

  public add(obj: T, priority: Priority = Priority.MEDIUM): Promise<Array<QueueObject<T>>> {
    if (priority < Priority.LOW) {
      throw new TypeError(`Priority can't be less than ${Priority.LOW}.`);
    }
    if (priority > Priority.MEDIUM) {
      this.queue.unshift({obj, priority});
    } else if (priority > Priority.LOW) {
      this.queue.splice(Math.floor(this.queue.length / 2), 0, {obj, priority});
    } else {
      this.queue.push({obj, priority});
    }
    return Promise.resolve(this.queue);
  }

  public getAll(): Array<QueueObject<T>> {
    return this.queue;
  }
}
