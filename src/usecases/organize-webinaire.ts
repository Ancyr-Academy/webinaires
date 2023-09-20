import { Webinaire } from '../entities/webinaire.entity';
import { IDateGenerator } from '../ports/date-generator.interface';
import { IIDGenerator } from '../ports/id-generator.interface';
import { IWebinaireRepository } from '../ports/webinaire-repository.interface';

export class OrganizeWebinaire {
  constructor(
    private readonly repository: IWebinaireRepository,
    private readonly idGenerator: IIDGenerator,
    private readonly dateGenerator: IDateGenerator,
  ) {}

  async execute(data: {
    title: string;
    seats: number;
    startDate: Date;
    endDate: Date;
  }) {
    const id = this.idGenerator.generate();
    const webinaire = new Webinaire({
      id,
      title: data.title,
      seats: data.seats,
      startDate: data.startDate,
      endDate: data.endDate,
    });

    if (webinaire.isTooClose(this.dateGenerator.now())) {
      throw new Error('The webinaire must happen in at least 3 days');
    }

    if (webinaire.hasTooManySeats()) {
      throw new Error('The webinaire must have a maximum of 1000 seats');
    }

    if (webinaire.hasNoSeats()) {
      throw new Error('The webinaire must at least have 1 seat');
    }

    await this.repository.create(webinaire);

    return { id };
  }
}
