import { Webinaire } from '../entities/webinaire.entity';
import { IWebinaireRepository } from '../ports/webinaire-repository.interface';

export class InMemoryWebinaireRepository implements IWebinaireRepository {
  public database: Webinaire[] = [];
  async create(webinaire: Webinaire): Promise<void> {
    this.database.push(webinaire);
  }
}
