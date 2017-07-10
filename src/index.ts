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

export default class RunQueue <T> {
  private queue: Array<QueueObject<T>> = [];

  constructor(comparator?: Function) {

  }

  public add(obj: T, priority: Priority = Priority.MEDIUM): Promise<Array<QueueObject<T>>> {
    this.queue.push({obj, priority});
    return Promise.resolve(this.queue);
  }

  public getAll(): Array<QueueObject<T>> {
    return this.queue;
  }
}
