import * as deepObjectDiff from 'deep-object-diff';
import { Model } from 'mongoose';
import { Webinaire } from '../../entities/webinaire.entity';
import { IWebinaireRepository } from '../../ports/webinaire-repository.interface';
import { MongoWebinaire } from './mongo-webinaire';

export class MongoWebinaireRepository implements IWebinaireRepository {
  constructor(private readonly model: Model<MongoWebinaire.SchemaClass>) {}

  async findById(id: string): Promise<Webinaire | null> {
    const record = await this.model.findById(id);
    if (!record) {
      return null;
    }

    return new Webinaire({
      id: record._id,
      organizerId: record.organizerId,
      title: record.title,
      seats: record.seats,
      startDate: record.startDate,
      endDate: record.endDate,
    });
  }

  async create(webinaire: Webinaire): Promise<void> {
    const record = new this.model({
      _id: webinaire.props.id,
      organizerId: webinaire.props.organizerId,
      title: webinaire.props.title,
      seats: webinaire.props.seats,
      startDate: webinaire.props.startDate,
      endDate: webinaire.props.endDate,
    });

    await record.save();
  }

  async update(webinaire: Webinaire): Promise<void> {
    const record = await this.model.findById(webinaire.props.id);
    if (!record) {
      return;
    }

    const diff = deepObjectDiff.diff(webinaire.initialState, webinaire.props);
    await record.updateOne(diff);
    webinaire.commit();
  }

  async delete(webinaire: Webinaire): Promise<void> {
    await this.model.findByIdAndDelete(webinaire.props.id);
  }
}
