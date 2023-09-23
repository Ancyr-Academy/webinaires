import { Participation } from '../entities/participation.entity';

export const I_PARTICIPATION_REPOSITORY = 'I_PARTICIPATION_REPOSITORY';

export interface IParticipationRepository {
  findByWebinaireId(webinaireId: string): Promise<Participation[]>;
}
