const {Priority, PriorityQueue} = require('../dist/commonjs/index');

describe('PriorityQueue', () => {
  describe('"add"', () => {
    it('works with thunked Promises', (done) => {
      const queue = new PriorityQueue();

      Promise.all([
        queue.add(() => Promise.resolve('ape')),
        queue.add(() => Promise.resolve('cat')),
        queue.add(() => Promise.resolve('dog')),
        queue.add(() => Promise.resolve('zebra'))
      ]).then((results) => {
        expect(results[0]).toBe('ape');
        expect(results[1]).toBe('cat');
        expect(results[2]).toBe('dog');
        expect(results[3]).toBe('zebra');
        done();
      });
    });
  });

  it('works with thunked functions', (done) => {
    function happyFn() {
      return 'happy';
    }

    const queue = new PriorityQueue();
    queue.add(() => happyFn()).then(value => {
      expect(value).toBe('happy');
      done();
    });
  });

  it('works with thunked primitive values', (done) => {
    const queue = new PriorityQueue();

    Promise.all([
      queue.add(() => 'ape'),
      queue.add(() => 'cat'),
      queue.add(() => 'dog'),
      queue.add(() => 'zebra')
    ]).then((results) => {
      expect(results[0]).toBe('ape');
      expect(results[1]).toBe('cat');
      expect(results[2]).toBe('dog');
      expect(results[3]).toBe('zebra');
      done();
    });
  });

  it('catches throwing thunked functions', (done) => {
    function notHappyFn() {
      throw Error('not so happy')
    }

    const queue = new PriorityQueue();
    queue.add(() => notHappyFn())
      .catch(error => {
        expect(error.message).toBe('not so happy');
        done();
      });
  });
});