import { IMailer } from '../../core/ports/mailer.interface';
import { Executable } from '../../shared/executable';
import { User } from '../../users/entities/user.entity';
import { IUserRepository } from '../../users/ports/user-repository.interface';
import { Webinaire } from '../entities/webinaire.entity';
import { WebinaireNotFoundException } from '../exceptions/webinaire-not-found';
import { WebinaireUpdateForbiddenException } from '../exceptions/webinaire-update-forbidden';
import { IParticipationRepository } from '../ports/participation-repository.interface';
import { IWebinaireRepository } from '../ports/webinaire-repository.interface';

type Request = {
  user: User;
  webinaireId: string;
};

type Response = void;

export class CancelWebinaire implements Executable<Request, Response> {
  constructor(
    private readonly webinaireRepository: IWebinaireRepository,
    private readonly mailer: IMailer,
    private readonly participationRepository: IParticipationRepository,
    private readonly usersRepository: IUserRepository,
  ) {}

  async execute({ user, webinaireId }: Request): Promise<Response> {
    const webinaire = await this.webinaireRepository.findById(webinaireId);

    if (!webinaire) {
      throw new WebinaireNotFoundException();
    }

    if (webinaire.isOrganizer(user) === false) {
      throw new WebinaireUpdateForbiddenException();
    }

    await this.webinaireRepository.delete(webinaire);
    await this.sendEmailToParticipants(webinaire);
  }

  async sendEmailToParticipants(webinaire: Webinaire): Promise<void> {
    const participations = await this.participationRepository.findByWebinaireId(
      webinaire.props.id,
    );

    const users = (await Promise.all(
      participations
        .map((participation) =>
          this.usersRepository.findById(participation.props.userId),
        )
        .filter((user) => user !== null),
    )) as User[];

    await Promise.all(
      users.map((user) => {
        return this.mailer.send({
          to: user.props.emailAddress,
          subject: 'Webinaire canceled',
          body: `The webinaire "${webinaire.props.title}" has been canceled.`,
        });
      }),
    );
  }
}
