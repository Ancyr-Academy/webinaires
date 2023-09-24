import { IMailer } from '../../core/ports/mailer.interface';
import { Executable } from '../../shared/executable';
import { User } from '../../users/entities/user.entity';
import { IUserRepository } from '../../users/ports/user-repository.interface';
import { Webinaire } from '../entities/webinaire.entity';
import { ParticipationNotFoundException } from '../exceptions/participation-not-found';
import { WebinaireNotFoundException } from '../exceptions/webinaire-not-found';
import { IParticipationRepository } from '../ports/participation-repository.interface';
import { IWebinaireRepository } from '../ports/webinaire-repository.interface';

type Request = {
  user: User;
  webinaireId: string;
};

type Response = void;

export class CancelSeat implements Executable<Request, Response> {
  constructor(
    private readonly webinaireRepository: IWebinaireRepository,
    private readonly participationRepository: IParticipationRepository,
    private readonly userRepository: IUserRepository,
    private readonly mailer: IMailer,
  ) {}

  async execute({ user, webinaireId }: Request): Promise<void> {
    const webinaire = await this.webinaireRepository.findById(webinaireId);
    if (!webinaire) {
      throw new WebinaireNotFoundException();
    }

    const participation = await this.participationRepository.findOne(
      user.props.id,
      webinaireId,
    );

    if (!participation) {
      throw new ParticipationNotFoundException();
    }

    await this.participationRepository.delete(participation);

    await this.sendEmailToOrganizer(webinaire);
    await this.sendEmailToParticipant(user, webinaire);
  }

  private async sendEmailToOrganizer(webinaire: Webinaire): Promise<void> {
    const organizer = await this.userRepository.findById(
      webinaire!.props.organizerId,
    );

    await this.mailer.send({
      to: organizer!.props.emailAddress,
      subject: `A participant has canceled their seat`,
      body: `A participant has canceled their seat for the webinaire "${
        webinaire!.props.title
      }".`,
    });
  }

  private async sendEmailToParticipant(user: User, webinaire: Webinaire) {
    await this.mailer.send({
      to: user.props.emailAddress,
      subject: `Your participation cancellation`,
      body: `You have canceled your participation to the webinaire "${
        webinaire!.props.title
      }".`,
    });
  }
}
