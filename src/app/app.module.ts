import { Module } from '@nestjs/common';

import { APP_GUARD } from '@nestjs/core';
import { CurrentDateGenerator } from '../adapters/current-date-generator';
import { InMemoryUserRepository } from '../adapters/in-memory-user-repository';
import { InMemoryWebinaireRepository } from '../adapters/in-memory-webinaire-repository';
import { RandomIDGenerator } from '../adapters/random-id-generator';
import { Authenticator } from '../services/authenticator';
import { OrganizeWebinaire } from '../usecases/organize-webinaire';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthGuard } from './auth.guard';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    AppService,
    CurrentDateGenerator,
    RandomIDGenerator,
    InMemoryWebinaireRepository,
    InMemoryUserRepository,
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
    {
      provide: Authenticator,
      inject: [InMemoryUserRepository],
      useFactory: (repository) => {
        return new Authenticator(repository);
      },
    },
    {
      provide: APP_GUARD,
      inject: [Authenticator],
      useFactory: (authenticator) => {
        return new AuthGuard(authenticator);
      },
    },
  ],
})
export class AppModule {}
