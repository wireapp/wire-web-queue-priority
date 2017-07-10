import {Priority, RunQueue} from '../../dist/commonjs';

console.log(RunQueue);

describe('RunQueue', () => {
  let queue;

  beforeEach((done) => {
    queue = new RunQueue();
    done();
  });

  describe('add', () => {
    it('adds objects to the queue', (done) => {
      Promise.all([
        queue.add('test-medium', Priority.MEDIUM),
        queue.add('test-low', Priority.LOW),
        queue.add('test-2', 2),
        queue.add('test-high', Priority.HIGH),
      ])
      .then(([array]) => {
        expect(array.length).toBe(4);
        expect(array[0].priority).toBe(Priority.HIGH);
        expect(array[3].priority).toBe(Priority.LOW);
        done();
      })
      .catch((error) => done.fail(error));
    });

    it('doesn\'t add objects with negative priority', (done) => {
      expect(() => queue.add('test', -3))
        .toThrow(TypeError('Priority can\'t be less than 0.'));
      done();
    });
  });
});
