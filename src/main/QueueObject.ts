export default class QueueObject<P> {
  fn: Function;
  priority: P;
  reject: Function;
  resolve: Function;
  retry: number;
  timestamp: number;
}
