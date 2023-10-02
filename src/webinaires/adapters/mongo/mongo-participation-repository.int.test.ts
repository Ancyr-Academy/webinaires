import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TestApp } from '../../../tests/utils/test-app';
import { Participation } from '../../entities/participation.entity';
import { MongoParticipation } from './mongo-participation';
import { MongoParticipationRepository } from './mongo-participation-repository';

describe('MongoParticipationRepository', () => {
  async function createParticipationInDatabase(participation: Participation) {
    const record = new model({
      _id: MongoParticipation.SchemaClass.makeId(participation),
      webinaireId: participation.props.webinaireId,
      userId: participation.props.userId,
    });

    await record.save();
  }

  const savedParticipation = new Participation({
    webinaireId: 'webinaire-1',
    userId: 'user-1',
  });

  let app: TestApp;
  let model: Model<MongoParticipation.SchemaClass>;
  let repository: MongoParticipationRepository;

  beforeEach(async () => {
    app = new TestApp();
    await app.setup();

    model = app.get<Model<MongoParticipation.SchemaClass>>(
      getModelToken(MongoParticipation.CollectionName),
    );

    repository = new MongoParticipationRepository(model);

    await createParticipationInDatabase(savedParticipation);
  });

  afterEach(async () => {
    await app.cleanup();
  });

  describe('findOne', () => {
    it('should find the participation', async () => {
      const participation = await repository.findOne(
        savedParticipation.props.userId,
        savedParticipation.props.webinaireId,
      );

      expect(participation!.props).toEqual(savedParticipation.props);
    });

    it('should return null when the participation does not exist', async () => {
      const participation = await repository.findOne('no-user', 'no-webinaire');
      expect(participation).toEqual(null);
    });
  });
  describe('findByWebinaireId', () => {
    it('should return the list of participations if there is any', async () => {
      const participation = await repository.findByWebinaireId(
        savedParticipation.props.webinaireId,
      );

      expect(participation.length).toBe(1);
      expect(participation[0].props).toEqual(savedParticipation.props);
    });
  });

  describe('findParticipationCount', () => {
    it('should return the number of participations', async () => {
      const participation = await repository.findParticipationCount(
        savedParticipation.props.webinaireId,
      );

      expect(participation).toBe(1);
    });
  });

  describe('create', () => {
    it('should create the participation', async () => {
      const participation = new Participation({
        webinaireId: 'webinaire-2',
        userId: 'user-2',
      });

      await repository.create(participation);

      const record = await model.findOne({
        userId: participation.props.userId,
        webinaireId: participation.props.webinaireId,
      });

      expect(record?.toObject()).toEqual({
        __v: 0,
        _id: MongoParticipation.SchemaClass.makeId(participation),
        webinaireId: participation.props.webinaireId,
        userId: participation.props.userId,
      });
    });
  });

  describe('delete', () => {
    it('should delete the participation', async () => {
      await repository.delete(savedParticipation);

      const record = await model.findOne({
        userId: savedParticipation.props.userId,
        webinaireId: savedParticipation.props.webinaireId,
      });

      expect(record).toBe(null);
    });
  });
});
