import { Webinaire } from '../entities/webinaire.entity';
import { IIDGenerator } from '../ports/id-generator.interface';
import { IWebinaireRepository } from '../ports/webinaire-repository.interface';

export class OrganizeWebinaire {
  constructor(
    private readonly repository: IWebinaireRepository,
    private readonly idGenerator: IIDGenerator,
  ) {}

  async execute(data: {
    title: string;
    seats: number;
    startDate: Date;
    endDate: Date;
  }) {
    const id = this.idGenerator.generate();

    this.repository.create(
      new Webinaire({
        id,
        title: data.title,
        seats: data.seats,
        startDate: data.startDate,
        endDate: data.endDate,
      }),
    );

    return { id };
  }
}
