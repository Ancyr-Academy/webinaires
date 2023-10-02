import { DomainException } from '../../shared/exception';
import { Executable } from '../../shared/executable';
import { User } from '../../users/entities/user.entity';
import { WebinaireNotFoundException } from '../exceptions/webinaire-not-found';
import { WebinaireTooManySeatsException } from '../exceptions/webinaire-too-many-seats';
import { WebinaireUpdateForbiddenException } from '../exceptions/webinaire-update-forbidden';
import { IWebinaireRepository } from '../ports/webinaire-repository.interface';

type Request = {
  user: User;
  webinaireId: string;
  seats: number;
};

type Response = void;

export class ChangeSeats implements Executable<Request, Response> {
  constructor(private readonly webinaireRepository: IWebinaireRepository) {}

  async execute({ user, webinaireId, seats }: Request): Promise<Response> {
    const webinaire = await this.webinaireRepository.findById(webinaireId);

    if (!webinaire) {
      throw new WebinaireNotFoundException();
    }

    if (webinaire.isOrganizer(user) === false) {
      throw new WebinaireUpdateForbiddenException();
    }

    if (seats < webinaire.props.seats) {
      throw new DomainException('You cannot reduce the number of seats');
    }

    webinaire.update({ seats });

    if (webinaire.hasTooManySeats()) {
      throw new WebinaireTooManySeatsException();
    }

    await this.webinaireRepository.update(webinaire);
  }
}
