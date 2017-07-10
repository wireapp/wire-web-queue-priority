import {Priority, RunQueue} from '../../dist/commonjs';

describe('RunQueue', () => {
  let queue;

  beforeEach((done) => {
    queue = new RunQueue();
    done();
  });

  describe('"add"', () => {
    it('adds objects', (done) => {
      queue.add('ape');
      queue.add('cat');
      queue.add('dog');
      queue.add('zebra');
      expect(queue.size).toBe(4);
      done();
    });

    it('adds objects with priorities', (done) => {
      queue.add('ape');
      queue.add('cat', Priority.LOW);
      queue.add('dog', Priority.HIGH);
      queue.add('zebra');
      expect(queue.first).toBe('dog');
      expect(queue.last).toBe('cat');
      done();
    });
  });
});
