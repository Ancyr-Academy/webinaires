import { Webinaire } from '../../webinaires/entities/webinaire.entity';
import {
  IWebinaireRepository,
  I_WEBINAIRE_REPOSITORY,
} from '../../webinaires/ports/webinaire-repository.interface';
import { IFixture } from '../utils/fixture';
import { TestApp } from '../utils/test-app';

export class WebinaireFixture implements IFixture {
  constructor(public entity: Webinaire) {}

  async load(app: TestApp): Promise<void> {
    const webinaireRepository = app.get<IWebinaireRepository>(
      I_WEBINAIRE_REPOSITORY,
    );

    await webinaireRepository.create(this.entity);
  }
}
