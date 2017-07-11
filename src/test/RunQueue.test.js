import {Priority as RunQueuePriority, RunQueue} from '../../dist/commonjs';

describe('RunQueue', () => {
  describe('"add"', () => {
    it('adds objects', () => {
      const queue = new RunQueue();

      queue.add('ape');
      queue.add('cat');
      queue.add('dog');
      queue.add('zebra');
      expect(queue.size).toBe(4);
    });

    it('adds objects with priorities', () => {
      const queue = new RunQueue();

      queue.add('ape');
      queue.add('cat', RunQueuePriority.LOW);
      queue.add('dog', RunQueuePriority.HIGH);
      queue.add('zebra');
      expect(queue.first).toBe('dog');
      expect(queue.last).toBe('cat');
    });
  });

  describe('"run"', () => {
    it('executes an item from the queue', done => {
      const queue = new RunQueue();

      const ape = Promise.resolve('ape').then(item => {
        expect(item).toBe('ape');
        expect(queue.size).toBe(3);
        expect(queue.first).toBe('cat');
        expect(queue.last).toBe('zebra');
        done();
      });

      queue.add(ape);
      queue.add('cat');
      queue.add('dog');
      queue.add('zebra');
      queue.run();
    });

    it('executes an item from the queue', done => {
      const queue = new RunQueue();

      const promise1 = Promise.resolve('one').then(item => expect(item).toBe('one'));
      const promise2 = Promise.resolve('two').then(item => expect(item).toBe('two'));
      const promise3 = Promise.resolve('three').then(item => {
        expect(item).toBe('three');
        done();
      });

      queue.add(promise1, RunQueuePriority.HIGH);
      queue.add(promise2, RunQueuePriority.MEDIUM);
      queue.add(promise3, RunQueuePriority.LOW);
      queue.run();
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

      const promise1 = businessLogic('A').catch(err => businessLogic(42)).then(item => expect(item).toBe(42));
      const promise2 = Promise.resolve('two').then(item => expect(item).toBe('two'));
      const promise3 = Promise.resolve('three').then(item => {
        expect(item).toBe('three');
        done();
      });

      queue.add(promise1, RunQueuePriority.HIGH);
      queue.add(promise2, RunQueuePriority.MEDIUM);
      queue.add(promise3, RunQueuePriority.LOW);
      queue.run();
    });
  });

  describe('"comparator"', () => {
    it('uses a descending priority order by default', () => {
      const queue = new RunQueue();

      queue.add('ape', RunQueuePriority.HIGH);
      queue.add('cat');
      queue.add('dog');
      queue.add('zebra', RunQueuePriority.LOW);
      expect(queue.first).toBe('ape');
      expect(queue.last).toBe('zebra');
    });

    it('supports a custom comparator', () => {
      const ascendingPriority = (a, b) => a.priority - b.priority;
      const queue = new RunQueue(ascendingPriority);

      queue.add('ape', RunQueuePriority.HIGH);
      queue.add('cat');
      queue.add('dog');
      queue.add('zebra', RunQueuePriority.LOW);
      expect(queue.first).toBe('zebra');
      expect(queue.last).toBe('ape');
    });
  });
});
