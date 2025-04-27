import { Inject } from '@nestjs/common'
import sgMail from '@sendgrid/mail'
import { SENDGRID_CONFIG_OPTIONS } from './constants'
import { ConfigOptions } from './types'

export class SendgridService {
  constructor(@Inject(SENDGRID_CONFIG_OPTIONS) { apikey }: ConfigOptions) {
    sgMail.setApiKey(apikey)
  }

  async setApiKey(key: string) {
    sgMail.setApiKey(key)
  }

  async send(mail: sgMail.MailDataRequired) {
    const sg = await sgMail.send(mail)

    return sg
  }

  async sendHTMLEmail(
    to: string,
    from: string,
    subject: string,
    body: string,
    plain?: string,
    cc?: string,
    bcc?: string,
  ) {
    const mail = {
      to: to,
      from: from,
      cc: cc,
      bcc: bcc,
      subject: subject,
      text: plain,
      html: body,
    }

    const sg = await sgMail.send(mail)

    return sg
  }

  async sendTemplateEmail(
    to: string,
    from: string,
    subject: string,
    templateId: string,
    templateData: JSON,
  ) {
    const mail = {
      to: to,
      from: from,
      subject: subject,
      templateId: templateId,
      dynamicTemplateData: templateData,
    }

    const sg = await sgMail.send(mail)

    return sg
  }
}
