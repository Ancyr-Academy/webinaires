import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { CommonModule } from '../core/common.module';
import { I_DATE_GENERATOR } from '../core/ports/date-generator.interface';
import { I_ID_GENERATOR } from '../core/ports/id-generator.interface';
import { I_MAILER } from '../core/ports/mailer.interface';
import { MongoUser } from '../users/adapters/mongo/mongo-user';
import { I_USER_REPOSITORY } from '../users/ports/user-repository.interface';
import { UserModule } from '../users/user.module';
import { MongoParticipation } from './adapters/mongo/mongo-participation';
import { MongoParticipationRepository } from './adapters/mongo/mongo-participation-repository';
import { MongoWebinaire } from './adapters/mongo/mongo-webinaire';
import { MongoWebinaireRepository } from './adapters/mongo/mongo-webinaire-repository';
import { CancelSeat } from './commands/cancel-seat';
import { CancelWebinaire } from './commands/cancel-webinaire';
import { ChangeDates } from './commands/change-dates';
import { ChangeSeats } from './commands/change-seats';
import { OrganizeWebinaire } from './commands/organize-webinaire';
import { ReserveSeatCommandHandler } from './commands/reserve-seat';
import { ParticipationController } from './controllers/participation.controller';
import { WebinaireController } from './controllers/webinaire.controller';
import { I_PARTICIPATION_REPOSITORY } from './ports/participation-repository.interface';
import { I_WEBINAIRE_REPOSITORY } from './ports/webinaire-repository.interface';
import { GetWebinaireByIdQueryHandler } from './queries/get-webinaire-by-id';

@Module({
  imports: [
    CqrsModule,
    CommonModule,
    UserModule,
    MongooseModule.forFeature([
      {
        name: MongoWebinaire.CollectionName,
        schema: MongoWebinaire.Schema,
      },
      {
        name: MongoParticipation.CollectionName,
        schema: MongoParticipation.Schema,
      },
    ]),
  ],
  controllers: [WebinaireController, ParticipationController],
  providers: [
    {
      provide: I_WEBINAIRE_REPOSITORY,
      inject: [getModelToken(MongoWebinaire.CollectionName)],
      useFactory: (model) => {
        return new MongoWebinaireRepository(model);
      },
    },
    {
      provide: I_PARTICIPATION_REPOSITORY,
      inject: [getModelToken(MongoParticipation.CollectionName)],
      useFactory: (model) => {
        return new MongoParticipationRepository(model);
      },
    },
    {
      provide: GetWebinaireByIdQueryHandler,
      inject: [
        getModelToken(MongoWebinaire.CollectionName),
        getModelToken(MongoParticipation.CollectionName),
        getModelToken(MongoUser.CollectionName),
      ],
      useFactory: (webinaireModel, participationModel, userModel) => {
        return new GetWebinaireByIdQueryHandler(
          webinaireModel,
          participationModel,
          userModel,
        );
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
      provide: ReserveSeatCommandHandler,
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
        return new ReserveSeatCommandHandler(
          participationRepository,
          mailer,
          webinaireRepository,
          usersRepository,
        );
      },
    },
    {
      provide: CancelSeat,
      inject: [
        I_WEBINAIRE_REPOSITORY,
        I_PARTICIPATION_REPOSITORY,
        I_USER_REPOSITORY,
        I_MAILER,
      ],
      useFactory: (
        webinaireRepository,
        participationRepository,
        usersRepository,
        mailer,
      ) => {
        return new CancelSeat(
          webinaireRepository,
          participationRepository,
          usersRepository,
          mailer,
        );
      },
    },
  ],
  exports: [I_WEBINAIRE_REPOSITORY],
})
export class WebinaireModule {}
