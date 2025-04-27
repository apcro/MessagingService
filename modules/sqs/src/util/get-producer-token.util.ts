/**
 * Generates an injection token for a producer connected to a sqs queue with the given name.
 * @param queueName name of the queue that is managed by the producer.
 * @returns The SqsProducer injection token
 */
export function getProducerToken(queueName: string): string {
  return `SqsProducer_${queueName}`
}
