import { Module } from '@nestjs/common';

import { CurrentDateGenerator } from '../adapters/current-date-generator';
import { InMemoryWebinaireRepository } from '../adapters/in-memory-webinaire-repository';
import { RandomIDGenerator } from '../adapters/random-id-generator';
import { OrganizeWebinaire } from '../usecases/organize-webinaire';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    AppService,
    CurrentDateGenerator,
    RandomIDGenerator,
    InMemoryWebinaireRepository,
    {
      provide: OrganizeWebinaire,
      inject: [
        InMemoryWebinaireRepository,
        CurrentDateGenerator,
        RandomIDGenerator,
      ],
      useFactory: (repository, dateGenerator, idGenerator) => {
        return new OrganizeWebinaire(repository, idGenerator, dateGenerator);
      },
    },
  ],
})
export class AppModule {}
