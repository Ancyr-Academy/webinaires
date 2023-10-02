import { Model } from 'mongoose';
import { Participation } from '../../entities/participation.entity';
import { IParticipationRepository } from '../../ports/participation-repository.interface';
import { MongoParticipation } from './mongo-participation';

export class MongoParticipationRepository implements IParticipationRepository {
  constructor(private readonly model: Model<MongoParticipation.SchemaClass>) {}

  async findOne(
    userId: string,
    webinaireId: string,
  ): Promise<Participation | null> {
    const record = await this.model.findOne({
      userId,
      webinaireId,
    });

    if (!record) {
      return null;
    }

    return new Participation({
      userId: record.userId,
      webinaireId: record.webinaireId,
    });
  }

  async findByWebinaireId(webinaireId: string): Promise<Participation[]> {
    const participations = await this.model.find({ webinaireId });
    return participations.map(
      (record) =>
        new Participation({
          userId: record.userId,
          webinaireId: record.webinaireId,
        }),
    );
  }

  async findParticipationCount(webinaireId: string): Promise<number> {
    return this.model.countDocuments({ webinaireId });
  }

  async create(participation: Participation): Promise<void> {
    await this.model.create({
      _id: MongoParticipation.SchemaClass.makeId(participation),
      userId: participation.props.userId,
      webinaireId: participation.props.webinaireId,
    });
  }

  async delete(participation: Participation): Promise<void> {
    await this.model.deleteOne({
      userId: participation.props.userId,
      webinaireId: participation.props.webinaireId,
    });
  }
}
