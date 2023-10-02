import { NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { MongoUser } from '../../../users/adapters/mongo/mongo-user';
import { WebinaireDTO } from '../../dto/webinaire.dto';
import { GetWebinaireByIdQuery } from '../../ports/get-webinaire-by-id-query.interface';
import { MongoParticipation } from './mongo-participation';
import { MongoWebinaire } from './mongo-webinaire';

export class MongoGetWebinaireById implements GetWebinaireByIdQuery {
  constructor(
    private readonly webinaireModel: Model<MongoWebinaire.SchemaClass>,
    private readonly participationModel: Model<MongoParticipation.SchemaClass>,
    private readonly userModel: Model<MongoUser.SchemaClass>,
  ) {}

  async execute(id: string): Promise<WebinaireDTO> {
    const webinaire = await this.webinaireModel.findById(id);
    if (!webinaire) {
      throw new NotFoundException();
    }

    const organizer = await this.userModel.findById(webinaire.organizerId);
    if (!organizer) {
      throw new NotFoundException();
    }

    const participationsCount = await this.participationModel.countDocuments({
      webinaireId: webinaire.id,
    });

    return {
      id: webinaire.id,
      title: webinaire.title,
      startDate: webinaire.startDate,
      endDate: webinaire.endDate,
      organizer: {
        id: organizer.id,
        emailAddress: organizer.emailAddress,
      },
      seats: {
        reserved: participationsCount,
        available: webinaire.seats - participationsCount,
      },
    };
  }
}
