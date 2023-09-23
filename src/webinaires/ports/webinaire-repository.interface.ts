import { Webinaire } from '../entities/webinaire.entity';

export const I_WEBINAIRE_REPOSITORY = 'I_WEBINAIRE_REPOSITORY';

export interface IWebinaireRepository {
  findById(id: string): Promise<Webinaire | null>;
  create(webinaire: Webinaire): Promise<void>;
  update(webinaire: Webinaire): Promise<void>;
}
