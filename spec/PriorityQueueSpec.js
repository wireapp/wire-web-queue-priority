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

  describe('"run"', () => {
    it('doesn\'t run things in parallel', done => {
      const queue = new PriorityQueue();
      let state = undefined;

      const ape = () => {
        return new Promise(function (resolve) {
          expect(state).toBeUndefined();
          state = 'ape';
          setTimeout(() => {
            state = undefined;
            resolve('ape')
          }, 100)
        });
      };

      const cat = () => {
        return new Promise(function (resolve) {
          expect(state).toBeUndefined();
          state = 'cat';
          setTimeout(() => {
            state = undefined;
            resolve('cat')
          }, 300)
        });
      };

      const dog = () => {
        return new Promise(function (resolve) {
          expect(state).toBeUndefined();
          state = 'dog';
          setTimeout(() => {
            state = undefined;
            resolve('dog')
          }, 200)
        });
      };

      const zebra = () => {
        return new Promise(function (resolve) {
          expect(state).toBeUndefined();
          state = 'zebra';
          setTimeout(() => {
            state = undefined;
            resolve('zebra')
          }, 137)
        });
      };

      Promise.all([
        queue.add(ape),
        queue.add(cat),
        queue.add(dog),
        queue.add(zebra)
      ]).then((results) => {
        expect(results[0]).toBe('ape');
        expect(results[1]).toBe('cat');
        expect(results[2]).toBe('dog');
        expect(results[3]).toBe('zebra');
        done();
      });
    });
  });
});
