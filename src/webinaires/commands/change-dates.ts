import { IDateGenerator } from '../../core/ports/date-generator.interface';
import { IMailer } from '../../core/ports/mailer.interface';
import { Executable } from '../../shared/executable';
import { User } from '../../users/entities/user.entity';
import { IUserRepository } from '../../users/ports/user-repository.interface';
import { Webinaire } from '../entities/webinaire.entity';
import { WebinaireNotFoundException } from '../exceptions/webinaire-not-found';
import { WebinaireTooEarlyException } from '../exceptions/webinaire-too-early';
import { WebinaireUpdateForbiddenException } from '../exceptions/webinaire-update-forbidden';
import { IParticipationRepository } from '../ports/participation-repository.interface';
import { IWebinaireRepository } from '../ports/webinaire-repository.interface';

type Request = {
  user: User;
  webinaireId: string;
  startDate: Date;
  endDate: Date;
};

type Response = void;

export class ChangeDates implements Executable<Request, Response> {
  constructor(
    private readonly webinaireRepository: IWebinaireRepository,
    private readonly dateGenerator: IDateGenerator,
    private readonly participationRepository: IParticipationRepository,
    private readonly mailer: IMailer,
    private readonly usersRepository: IUserRepository,
  ) {}

  async execute({
    user,
    webinaireId,
    startDate,
    endDate,
  }: Request): Promise<Response> {
    const webinaire = await this.webinaireRepository.findById(webinaireId);

    if (webinaire === null) {
      throw new WebinaireNotFoundException();
    }

    if (webinaire.isOrganizer(user) === false) {
      throw new WebinaireUpdateForbiddenException();
    }

    webinaire.update({
      startDate,
      endDate,
    });

    if (webinaire.isTooClose(this.dateGenerator.now())) {
      throw new WebinaireTooEarlyException();
    }

    await this.webinaireRepository.update(webinaire);
    await this.sendEmailToParticipants(webinaire);
  }

  private async sendEmailToParticipants(webinaire: Webinaire): Promise<void> {
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
      users.map((user) =>
        this.mailer.send({
          to: user.props.emailAddress,
          subject: `Dates of the webinaire "${webinaire.props.title}" have changed`,
          body: `The dates of the webinaire "${webinaire.props.title}" have changed.`,
        }),
      ),
    );
  }
}
