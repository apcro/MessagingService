import { SqsMessageEntry } from '../producer/sqs-message-request.interface'

export function sizeOfMessage(message: SqsMessageEntry): number {
  let messageSize = byteSize(message.MessageBody ?? '')

  const messageAttributes = message.MessageAttributes
  if (!messageAttributes) {
    return messageSize
  }

  // All parts of the message attribute, including Name, Type, and Value, are part of the
  // message size restriction
  for (const attributeName in messageAttributes) {
    const attributeValue = messageAttributes[attributeName]
    messageSize += byteSize(attributeName)

    if (attributeValue.DataType) {
      messageSize += byteSize(attributeValue.DataType)
    }
    if (attributeValue.StringValue) {
      messageSize += byteSize(attributeValue.StringValue)
    } else if (attributeValue.BinaryValue) {
      messageSize += byteSize(attributeValue.BinaryValue)
    }
    // The AWS SQS client doesn't support `StringListValues` and `BinaryListValues`.
  }
  return messageSize
}

function byteSize(value: string | Uint8Array): number {
  return Buffer.from(value).length
}
