import { IMailer } from '../../core/ports/mailer.interface';
import { Executable } from '../../shared/executable';
import { User } from '../../users/entities/user.entity';
import { IUserRepository } from '../../users/ports/user-repository.interface';
import { Participation } from '../entities/participation.entity';
import { Webinaire } from '../entities/webinaire.entity';
import { NoMoreSeatAvailable as NoMoreSeatsAvailable } from '../exceptions/no-more-seats-available';
import { SeatAlreadyReservedException } from '../exceptions/seat-already-reserved';
import { WebinaireNotFoundException } from '../exceptions/webinaire-not-found';
import { IParticipationRepository } from '../ports/participation-repository.interface';
import { IWebinaireRepository } from '../ports/webinaire-repository.interface';

type Request = {
  user: User;
  webinaireId: string;
};

type Response = void;

export class ReserveSeat implements Executable<Request, Response> {
  constructor(
    private readonly participationRepository: IParticipationRepository,
    private readonly mailer: IMailer,
    private readonly webinaireRepository: IWebinaireRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute({ user, webinaireId }: Request): Promise<void> {
    const webinaire = await this.webinaireRepository.findById(webinaireId);

    if (!webinaire) {
      throw new WebinaireNotFoundException();
    }

    await this.assertUserIsNotAlreadyParticipating(user, webinaire);
    await this.assertHasEnoughSeats(webinaire);

    const participation = new Participation({
      userId: user.props.id,
      webinaireId: webinaireId,
    });

    await this.participationRepository.create(participation);

    await this.sendEmailToOrganizer(webinaire);
    await this.sendEmailToParticipant(webinaire, user);
  }

  private async assertUserIsNotAlreadyParticipating(
    user: User,
    webinaire: Webinaire,
  ) {
    const existingParticipation = await this.participationRepository.findOne(
      user.props.id,
      webinaire.props.id,
    );

    if (existingParticipation) {
      throw new SeatAlreadyReservedException();
    }
  }

  private async assertHasEnoughSeats(webinaire: Webinaire) {
    const participationCount =
      await this.participationRepository.findParticipationCount(
        webinaire.props.id,
      );

    if (participationCount >= webinaire.props.seats) {
      throw new NoMoreSeatsAvailable();
    }
  }

  private async sendEmailToOrganizer(webinaire: Webinaire): Promise<void> {
    const organizer = await this.userRepository.findById(
      webinaire!.props.organizerId,
    );

    await this.mailer.send({
      to: organizer!.props.emailAddress,
      subject: 'New participation',
      body: `A new user has reserved a seat for your webinaire "${
        webinaire!.props.title
      }".`,
    });
  }

  private async sendEmailToParticipant(webinaire: Webinaire, user: User) {
    await this.mailer.send({
      to: user.props.emailAddress,
      subject: 'Your participation to a webinaire',
      body: `You have reserved a seat for the webinaire "${
        webinaire!.props.title
      }".`,
    });
  }
}
