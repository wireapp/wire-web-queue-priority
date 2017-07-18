import {Priority, PriorityQueue} from '../../dist/commonjs';

describe('PriorityQueue', () => {
  describe('"add"', () => {
    it('adds objects', () => {
      const queue = new PriorityQueue();

      queue.add(() => 'ape');
      queue.add(() => 'cat');
      queue.add(() => 'dog');
      queue.add(() => 'zebra');

      expect(queue.size).toBe(4);
    });

    it('adds objects with priorities', () => {
      const queue = new PriorityQueue();

      queue.add(() => 'ape');
      queue.add(() => 'cat', Priority.LOW);
      queue.add(() => 'dog', Priority.HIGH);
      queue.add(() => 'zebra');

      expect(queue.first.fn()).toBe('dog');
      expect(queue.last.fn()).toBe('cat');
    });
  });

  describe('"run"', () => {
    it('executes an item from the queue', done => {
      const queue = new PriorityQueue();
      const ape = () => Promise.resolve('ape').then(done());

      queue.add(ape);
      queue.add(() => 'cat');
      queue.add(() => 'dog');
      queue.add(() => 'zebra');
    });

    it('executes an item from the queue with different priorities', done => {
      const queue = new PriorityQueue();

      const promise1 = () => Promise.resolve('one').then(item => expect(item).toBe('one'));
      const promise2 = () => Promise.resolve('two').then(item => expect(item).toBe('two'));
      const promise3 = () => Promise.resolve('three').then(item => {
        expect(item).toBe('three');
        done();
      });

      queue.add(promise1, Priority.HIGH);
      queue.add(promise2, Priority.MEDIUM);
      queue.add(promise3, Priority.LOW);
    });

    it('retries on error until the error gets resolved', done => {
      let isLocked = true;
      const unlock = () => isLocked = false;
      const businessLogic = () => {
        return new Promise(function (resolve, reject) {
          if (isLocked) {
            reject(new Error('Promise is locked.'));
          } else {
            resolve('Promise successfully executed.');
            done();
          }
        });
      };

      const queue = new PriorityQueue();
      queue.add(businessLogic);
      setTimeout(() => queue.add(unlock, Priority.HIGH), 1000);
    });

    it('works with error-catching Promises', done => {
      const queue = new PriorityQueue();

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

      queue.add(promise1, Priority.HIGH);
      queue.add(promise2, Priority.MEDIUM);
      queue.add(promise3, Priority.LOW);
    });

    it('executes a high priority element prior to other running elements ', done => {
      const queue = new PriorityQueue();

      const promise1 = () => Promise.resolve('one').then(item => expect(item).toBe('one'));
      const promise2 = () => Promise.reject('two');
      const promise3 = () => Promise.resolve('three').then(item => {
        expect(item).toBe('three');
        done();
      });

      queue.add(promise1);
      queue.add(promise2);

      setTimeout(() => queue.add(promise3, Priority.HIGH), 1000);
    });
  });

  describe('"comparator"', () => {
    it('uses a descending priority order by default', () => {
      const queue = new PriorityQueue();

      queue.add(() => 'ape', Priority.HIGH);
      queue.add(() => 'cat');
      queue.add(() => 'dog');
      queue.add(() => 'zebra', Priority.LOW);

      expect(queue.last.fn()).toBe('zebra');
      expect(queue.first.fn()).toBe('ape');
    });

    it('supports a custom comparator', () => {
      const ascendingPriority = (a, b) => a.priority - b.priority;
      const queue = new PriorityQueue(ascendingPriority);

      queue.add(() => 'ape', Priority.HIGH);
      queue.add(() => 'cat');
      queue.add(() => 'dog');
      queue.add(() => 'zebra', Priority.LOW);

      expect(queue.first.fn()).toBe('zebra');
      expect(queue.last.fn()).toBe('ape');
    });

    it('sorts by date if the priorities are the same', done => {
      const queue = new PriorityQueue();

      const promise1 = () => Promise.resolve('one').then(item => expect(item).toBe('one'));
      const promise2 = () => Promise.reject('two');
      const promise3 = () => Promise.resolve('three').then(item => {
        expect(item).toBe('three');
        done();
      });

      queue.add(promise1);
      queue.add(promise2);

      setTimeout(() => queue.add(promise3), 1000);
    });
  });
});
