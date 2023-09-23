import { Participation } from '../entities/participation.entity';

export interface IParticipationRepository {
  findByWebinaireId(webinaireId: string): Promise<Participation[]>;
}
