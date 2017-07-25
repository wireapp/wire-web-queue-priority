import QueueObject from './QueueObject';

interface Config<P> {
  comparator?: (a: QueueObject<P>, b: QueueObject<P>) => number,
  maxRetries?: number,
  retryDelay?: number
}

export default Config;
