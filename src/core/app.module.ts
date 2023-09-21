import { Module } from '@nestjs/common';

import { APP_GUARD } from '@nestjs/core';
import { I_USER_REPOSITORY } from '../users/ports/user-repository.interface';
import { Authenticator } from '../users/services/authenticator';
import { UserModule } from '../users/user.module';
import { WebinaireModule } from '../webinaires/webinaire.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthGuard } from './auth.guard';
import { CommonModule } from './common.module';

@Module({
  imports: [WebinaireModule, UserModule, CommonModule],
  controllers: [AppController],
  providers: [
    AppService,
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
  exports: [],
})
export class AppModule {}
