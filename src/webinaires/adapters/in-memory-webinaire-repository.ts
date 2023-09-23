import { Webinaire } from '../entities/webinaire.entity';
import { IWebinaireRepository } from '../ports/webinaire-repository.interface';

export class InMemoryWebinaireRepository implements IWebinaireRepository {
  constructor(public database: Webinaire[] = []) {}

  findByIdSync(id: string): Webinaire | null {
    const webinaire = this.database.find((w) => w.props.id === id);
    return webinaire ? new Webinaire({ ...webinaire.initialState }) : null;
  }

  async findById(id: string): Promise<Webinaire | null> {
    const webinaire = this.database.find((w) => w.props.id === id);
    return webinaire ? new Webinaire({ ...webinaire.initialState }) : null;
  }

  async create(webinaire: Webinaire): Promise<void> {
    this.database.push(webinaire);
  }

  async update(webinaire: Webinaire): Promise<void> {
    const index = this.database.findIndex(
      (w) => w.props.id === webinaire.props.id,
    );

    this.database[index] = webinaire;
    webinaire.commit();
  }
}
