import { HttpException, HttpStatus } from '@nestjs/common'

export class EventPublishFailureException extends HttpException {
  constructor(data?: unknown) {
    super(
      { message: 'Unable to publish the event', data },
      HttpStatus.INTERNAL_SERVER_ERROR,
    )
  }
}
