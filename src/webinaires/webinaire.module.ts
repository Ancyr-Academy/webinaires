import { Module } from '@nestjs/common';
import { CommonModule } from '../core/common.module';
import { I_DATE_GENERATOR } from '../core/ports/date-generator.interface';
import { I_ID_GENERATOR } from '../core/ports/id-generator.interface';
import { InMemoryWebinaireRepository } from './adapters/in-memory-webinaire-repository';
import { WebinaireController } from './controllers/webinaire.controller';
import { I_WEBINAIRE_REPOSITORY } from './ports/webinaire-repository.interface';
import { ChangeSeats } from './usecases/change-seats';
import { OrganizeWebinaire } from './usecases/organize-webinaire';

@Module({
  imports: [CommonModule],
  controllers: [WebinaireController],
  providers: [
    {
      provide: I_WEBINAIRE_REPOSITORY,
      useFactory: () => {
        return new InMemoryWebinaireRepository();
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
  ],
  exports: [I_WEBINAIRE_REPOSITORY],
})
export class WebinaireModule {}
