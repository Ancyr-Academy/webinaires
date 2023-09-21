import { Module } from '@nestjs/common';

import { CurrentDateGenerator } from './adapters/current-date-generator';
import { RandomIDGenerator } from './adapters/random-id-generator';
import { AppService } from './app.service';
import { I_DATE_GENERATOR } from './ports/date-generator.interface';
import { I_ID_GENERATOR } from './ports/id-generator.interface';

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
  ],
  exports: [I_DATE_GENERATOR, I_ID_GENERATOR],
})
export class CommonModule {}
