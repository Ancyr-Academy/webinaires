import { IDateGenerator } from '../../core/ports/date-generator.interface';
import { IMailer } from '../../core/ports/mailer.interface';
import { Executable } from '../../shared/executable';
import { User } from '../../users/entities/user.entity';
import { IUserRepository } from '../../users/ports/user-repository.interface';
import { Webinaire } from '../entities/webinaire.entity';
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

  async execute(request: Request): Promise<Response> {
    const webinaire = await this.webinaireRepository.findById(
      request.webinaireId,
    );

    if (webinaire === null) {
      throw new Error('Webinaire not found');
    }

    if (webinaire.props.organizerId !== request.user.props.id) {
      throw new Error('You are not allowed to update this webinaire');
    }

    webinaire.update({
      startDate: request.startDate,
      endDate: request.endDate,
    });

    if (webinaire.isTooClose(this.dateGenerator.now())) {
      throw new Error('The webinaire must happen in at least 3 days');
    }

    await this.webinaireRepository.update(webinaire);
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
