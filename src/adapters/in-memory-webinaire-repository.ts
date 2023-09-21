import { Webinaire } from '../entities/webinaire.entity';
import { IWebinaireRepository } from '../ports/webinaire-repository.interface';

export class InMemoryWebinaireRepository implements IWebinaireRepository {
  public database: Webinaire[] = [];

  async findById(id: string): Promise<Webinaire | null> {
    const webinaire = this.database.find((w) => w.props.id === id);
    return webinaire ?? null;
  }

  async create(webinaire: Webinaire): Promise<void> {
    this.database.push(webinaire);
  }
}
