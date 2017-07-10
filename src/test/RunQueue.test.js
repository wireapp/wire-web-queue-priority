import RunQueue from '../../dist/commonjs';

describe('RunQueue', () => {
  let queue;

  beforeEach((done) => {
    queue = new RunQueue();
    done();
  });

  describe('add', () => {
    it('should add objects to the queue', (done) => {
      queue.add('test')
        .then((array) => {
          expect(array.length).toBe(1);
          done();
        })
        .catch((error) => done.fail(error));
    });
  });
});
