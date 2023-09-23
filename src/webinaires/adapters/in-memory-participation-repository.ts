import { Participation } from '../entities/participation.entity';
import { IParticipationRepository } from '../ports/participation-repository.interface';

export class InMemoryParticipationRepository
  implements IParticipationRepository
{
  constructor(public readonly database: Participation[] = []) {}

  async findByWebinaireId(webinaireId: string): Promise<Participation[]> {
    return this.database.filter(
      (participation) => participation.props.webinaireId === webinaireId,
    );
  }
}
