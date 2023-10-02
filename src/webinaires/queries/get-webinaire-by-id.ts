import { NotFoundException } from '@nestjs/common';
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Model } from 'mongoose';
import { MongoUser } from '../../users/adapters/mongo/mongo-user';
import { MongoParticipation } from '../adapters/mongo/mongo-participation';
import { MongoWebinaire } from '../adapters/mongo/mongo-webinaire';
import { WebinaireDTO } from '../dto/webinaire.dto';

export class GetWebinaireByIdQuery implements IQuery {
  constructor(public id: string) {}
}

@QueryHandler(GetWebinaireByIdQuery)
export class GetWebinaireByIdQueryHandler implements IQueryHandler {
  constructor(
    private readonly webinaireModel: Model<MongoWebinaire.SchemaClass>,
    private readonly participationModel: Model<MongoParticipation.SchemaClass>,
    private readonly userModel: Model<MongoUser.SchemaClass>,
  ) {}

  async execute({ id }: GetWebinaireByIdQuery): Promise<WebinaireDTO> {
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
