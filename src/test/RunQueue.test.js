import {Priority as RunQueuePriority, RunQueue} from '../../dist/commonjs';

describe('RunQueue', () => {
  describe('"add"', () => {
    it('adds objects', () => {
      const queue = new RunQueue();

      queue.add(() => 'ape');
      queue.add(() => 'cat');
      queue.add(() => 'dog');
      queue.add(() => 'zebra');
      expect(queue.size).toBe(4);
    });

    it('adds objects with priorities', () => {
      const queue = new RunQueue();

      queue.add(() => 'ape');
      queue.add(() => 'cat', RunQueuePriority.LOW);
      queue.add(() => 'dog', RunQueuePriority.HIGH);
      queue.add(() => 'zebra');
      expect(queue.first.fn()).toBe('dog');
      expect(queue.last.fn()).toBe('cat');
    });
  });

  describe('"run"', () => {
    it('executes an item from the queue', done => {
      const queue = new RunQueue();
      const ape = () => Promise.resolve('ape').then(done());

      queue.add(ape);
      queue.add(() => 'cat');
      queue.add(() => 'dog');
      queue.add(() => 'zebra');
    });

    it('executes an item from the queue', done => {
      const queue = new RunQueue();

      const promise1 = () => Promise.resolve('one').then(item => expect(item).toBe('one'));
      const promise2 = () => Promise.resolve('two').then(item => expect(item).toBe('two'));
      const promise3 = () => Promise.resolve('three').then(item => {
        expect(item).toBe('three');
        done();
      });

      queue.add(promise1, RunQueuePriority.HIGH);
      queue.add(promise2, RunQueuePriority.MEDIUM);
      queue.add(promise3, RunQueuePriority.LOW);
    });

    it('waits until an error is resolved', done => {
      const queue = new RunQueue();

      function businessLogic(param) {
        return new Promise((resolve, reject) => {
          if (isNaN(param)) {
            reject(new TypeError('Not a Number'));
          } else {
            resolve(param);
          }
        });
      }

      const promise1 = () => businessLogic('A').catch(() => businessLogic(42)).then(item => expect(item).toBe(42));
      const promise2 = () => Promise.resolve('two').then(item => expect(item).toBe('two'));
      const promise3 = () => Promise.resolve('three').then(() => done());

      queue.add(promise1, RunQueuePriority.HIGH);
      queue.add(promise2, RunQueuePriority.MEDIUM);
      queue.add(promise3, RunQueuePriority.LOW);
    });

    it('executes a high priority element prior to other running elements ', done => {
      const queue = new RunQueue();

      const promise1 = () => Promise.resolve('one').then(item => expect(item).toBe('one'));
      const promise2 = () => Promise.reject('two');
      const promise3 = () => Promise.resolve('three').then(item => {
        expect(item).toBe('three');
        done();
      });

      queue.add(promise1);
      queue.add(promise2);
      setTimeout(() => queue.add(promise3, RunQueuePriority.HIGH), 1000);
    });
  });

  describe('"comparator"', () => {
    it('uses a descending priority order by default', () => {
      const queue = new RunQueue();

      queue.add(() => 'ape', RunQueuePriority.HIGH);
      queue.add(() => 'cat');
      queue.add(() => 'dog');
      queue.add(() => 'zebra', RunQueuePriority.LOW);
      expect(queue.last.fn()).toBe('zebra');
      expect(queue.first.fn()).toBe('ape');
    });

    it('supports a custom comparator', () => {
      const ascendingPriority = (a, b) => a.priority - b.priority;
      const queue = new RunQueue(ascendingPriority);

      queue.add(() => 'ape', RunQueuePriority.HIGH);
      queue.add(() => 'cat');
      queue.add(() => 'dog');
      queue.add(() => 'zebra', RunQueuePriority.LOW);
      expect(queue.first.fn()).toBe('zebra');
      expect(queue.last.fn()).toBe('ape');
    });
  });
});
