import { IDateGenerator } from '../../core/ports/date-generator.interface';
import { IIDGenerator } from '../../core/ports/id-generator.interface';
import { Executable } from '../../shared/executable';
import { User } from '../../users/entities/user.entity';
import { Webinaire } from '../entities/webinaire.entity';
import { IWebinaireRepository } from '../ports/webinaire-repository.interface';

type Request = {
  user: User;
  title: string;
  seats: number;
  startDate: Date;
  endDate: Date;
};

type Response = {
  id: string;
};

export class OrganizeWebinaire implements Executable<Request, Response> {
  constructor(
    private readonly repository: IWebinaireRepository,
    private readonly idGenerator: IIDGenerator,
    private readonly dateGenerator: IDateGenerator,
  ) {}

  async execute(data: Request) {
    const id = this.idGenerator.generate();
    const webinaire = new Webinaire({
      id,
      organizerId: data.user.props.id,
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
