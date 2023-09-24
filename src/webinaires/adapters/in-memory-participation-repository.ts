import { Participation } from '../entities/participation.entity';
import { IParticipationRepository } from '../ports/participation-repository.interface';

export class InMemoryParticipationRepository
  implements IParticipationRepository
{
  constructor(public readonly database: Participation[] = []) {}

  async findOne(
    userId: string,
    webinaireId: string,
  ): Promise<Participation | null> {
    return this.findOneSync(userId, webinaireId);
  }

  async findByWebinaireId(webinaireId: string): Promise<Participation[]> {
    return this.database.filter(
      (participation) => participation.props.webinaireId === webinaireId,
    );
  }

  async findParticipationCount(webinaireId: string): Promise<number> {
    return this.database.reduce((count, participation) => {
      if (participation.props.webinaireId === webinaireId) {
        return count + 1;
      } else {
        return count;
      }
    }, 0);
  }

  async create(participation: Participation): Promise<void> {
    this.database.push(participation);
  }

  findOneSync(userId: string, webinaireId: string): Participation | null {
    return (
      this.database.find(
        (participation) =>
          participation.props.userId === userId &&
          participation.props.webinaireId === webinaireId,
      ) ?? null
    );
  }
}
