export class SqsQueueInfo {
  constructor(readonly name: string, readonly url: string) {}

  get isFifo(): boolean {
    return this.name.endsWith('.fifo')
  }
}
