import { Module } from '@nestjs/common';

import { APP_GUARD } from '@nestjs/core';
import { CurrentDateGenerator } from '../adapters/current-date-generator';
import { InMemoryUserRepository } from '../adapters/in-memory-user-repository';
import { InMemoryWebinaireRepository } from '../adapters/in-memory-webinaire-repository';
import { RandomIDGenerator } from '../adapters/random-id-generator';
import { I_DATE_GENERATOR } from '../ports/date-generator.interface';
import { I_ID_GENERATOR } from '../ports/id-generator.interface';
import { I_USER_REPOSITORY } from '../ports/user-repository.interface';
import { I_WEBINAIRE_REPOSITORY } from '../ports/webinaire-repository.interface';
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
    {
      provide: I_DATE_GENERATOR,
      useClass: CurrentDateGenerator,
    },
    {
      provide: I_ID_GENERATOR,
      useClass: RandomIDGenerator,
    },
    {
      provide: I_WEBINAIRE_REPOSITORY,
      useFactory: () => {
        return new InMemoryWebinaireRepository();
      },
    },
    {
      provide: I_USER_REPOSITORY,
      useFactory: () => {
        return new InMemoryUserRepository();
      },
    },
    {
      provide: OrganizeWebinaire,
      inject: [I_WEBINAIRE_REPOSITORY, I_DATE_GENERATOR, I_ID_GENERATOR],
      useFactory: (repository, dateGenerator, idGenerator) => {
        return new OrganizeWebinaire(repository, idGenerator, dateGenerator);
      },
    },
    {
      provide: Authenticator,
      inject: [I_USER_REPOSITORY],
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
