import { Webinaire } from '../entities/webinaire.entity';

export interface IWebinaireRepository {
  create(webinaire: Webinaire): Promise<void>;
}
