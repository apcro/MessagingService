import {
  ConfigurableModuleBuilder,
  DynamicModule,
  Module,
} from '@nestjs/common'
import { SENDGRID_CONFIG_OPTIONS } from './constants'
import { SendgridService } from './sendgrid.service'
import { ConfigOptions } from './types'

export const {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<ConfigOptions>().build()

@Module({})
export class SendgridModule extends ConfigurableModuleClass {
  static registerAsync(options: typeof ASYNC_OPTIONS_TYPE): DynamicModule {
    return {
      ...super.registerAsync(options),
      exports: [SendgridService, SENDGRID_CONFIG_OPTIONS],
      providers: [
        SendgridService,
        {
          provide: SENDGRID_CONFIG_OPTIONS,
          inject: options.inject,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          useFactory: options.useFactory!,
        },
      ],
    }
  }
}
