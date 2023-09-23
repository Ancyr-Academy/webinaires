import { Module } from '@nestjs/common';

import { CurrentDateGenerator } from './adapters/current-date-generator';
import { InMemoryMailer } from './adapters/in-memory-mailer';
import { RandomIDGenerator } from './adapters/random-id-generator';
import { AppService } from './app.service';
import { I_DATE_GENERATOR } from './ports/date-generator.interface';
import { I_ID_GENERATOR } from './ports/id-generator.interface';
import { I_MAILER } from './ports/mailer.interface';

@Module({
  imports: [],
  controllers: [],
  providers: [
    AppService,
    {
      provide: I_DATE_GENERATOR,
      useClass: CurrentDateGenerator,
    },
    {
      provide: I_ID_GENERATOR,
      useClass: RandomIDGenerator,
    },
    {
      provide: I_MAILER,
      useClass: InMemoryMailer,
    },
  ],
  exports: [I_DATE_GENERATOR, I_ID_GENERATOR, I_MAILER],
})
export class CommonModule {}
