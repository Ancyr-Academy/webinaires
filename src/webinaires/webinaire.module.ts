import { Module } from '@nestjs/common';
import { CommonModule } from '../core/common.module';
import { I_DATE_GENERATOR } from '../core/ports/date-generator.interface';
import { I_ID_GENERATOR } from '../core/ports/id-generator.interface';
import { I_MAILER } from '../core/ports/mailer.interface';
import { I_USER_REPOSITORY } from '../users/ports/user-repository.interface';
import { UserModule } from '../users/user.module';
import { InMemoryParticipationRepository } from './adapters/in-memory-participation-repository';
import { InMemoryWebinaireRepository } from './adapters/in-memory-webinaire-repository';
import { ParticipationController } from './controllers/participation.controller';
import { WebinaireController } from './controllers/webinaire.controller';
import { I_PARTICIPATION_REPOSITORY } from './ports/participation-repository.interface';
import { I_WEBINAIRE_REPOSITORY } from './ports/webinaire-repository.interface';
import { CancelWebinaire } from './usecases/cancel-webinaire';
import { ChangeDates } from './usecases/change-dates';
import { ChangeSeats } from './usecases/change-seats';
import { OrganizeWebinaire } from './usecases/organize-webinaire';
import { ReserveSeat } from './usecases/reserve-seat';

@Module({
  imports: [CommonModule, UserModule],
  controllers: [WebinaireController, ParticipationController],
  providers: [
    {
      provide: I_WEBINAIRE_REPOSITORY,
      useFactory: () => {
        return new InMemoryWebinaireRepository();
      },
    },
    {
      provide: I_PARTICIPATION_REPOSITORY,
      useFactory: () => {
        return new InMemoryParticipationRepository();
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
      provide: ChangeSeats,
      inject: [I_WEBINAIRE_REPOSITORY],
      useFactory: (repository) => {
        return new ChangeSeats(repository);
      },
    },
    {
      provide: ChangeDates,
      inject: [
        I_WEBINAIRE_REPOSITORY,
        I_DATE_GENERATOR,
        I_PARTICIPATION_REPOSITORY,
        I_MAILER,
        I_USER_REPOSITORY,
      ],
      useFactory: (
        webinaireRepository,
        dateGenerator,
        participationRepository,
        mailer,
        usersRepository,
      ) => {
        return new ChangeDates(
          webinaireRepository,
          dateGenerator,
          participationRepository,
          mailer,
          usersRepository,
        );
      },
    },
    {
      provide: CancelWebinaire,
      inject: [
        I_WEBINAIRE_REPOSITORY,
        I_MAILER,
        I_PARTICIPATION_REPOSITORY,
        I_USER_REPOSITORY,
      ],
      useFactory: (
        webinaireRepository,
        mailer,
        participationRepository,
        usersRepository,
      ) => {
        return new CancelWebinaire(
          webinaireRepository,
          mailer,
          participationRepository,
          usersRepository,
        );
      },
    },
    {
      provide: ReserveSeat,
      inject: [
        I_PARTICIPATION_REPOSITORY,
        I_MAILER,
        I_WEBINAIRE_REPOSITORY,
        I_USER_REPOSITORY,
      ],
      useFactory: (
        participationRepository,
        mailer,
        webinaireRepository,
        usersRepository,
      ) => {
        return new ReserveSeat(
          participationRepository,
          mailer,
          webinaireRepository,
          usersRepository,
        );
      },
    },
  ],
  exports: [I_WEBINAIRE_REPOSITORY],
})
export class WebinaireModule {}
