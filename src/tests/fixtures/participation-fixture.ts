import { Participation } from '../../webinaires/entities/participation.entity';
import {
  IParticipationRepository,
  I_PARTICIPATION_REPOSITORY,
} from '../../webinaires/ports/participation-repository.interface';
import { IFixture } from '../utils/fixture';
import { TestApp } from '../utils/test-app';

export class ParticipationFixture implements IFixture {
  constructor(public entity: Participation) {}

  async load(app: TestApp): Promise<void> {
    const participationRepository = app.get<IParticipationRepository>(
      I_PARTICIPATION_REPOSITORY,
    );

    await participationRepository.create(this.entity);
  }
}
