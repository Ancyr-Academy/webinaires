import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TestApp } from '../../../tests/utils/test-app';
import { Webinaire } from '../../entities/webinaire.entity';
import { MongoWebinaire } from './mongo-webinaire';
import { MongoWebinaireRepository } from './mongo-webinaire-repository';

const cleanArchitectureWebinaire = new Webinaire({
  id: 'clean-architecture-id',
  organizerId: 'organizerId',
  title: 'Clean Architecture',
  seats: 10,
  startDate: new Date('2023-01-01T00:00:00.000Z'),
  endDate: new Date('2023-01-01T02:00:00.000Z'),
});
const cqrsWebinaire = new Webinaire({
  id: 'cqrs-id',
  organizerId: 'organizerId',
  title: 'CQRS',
  seats: 10,
  startDate: new Date('2023-01-01T00:00:00.000Z'),
  endDate: new Date('2023-01-01T02:00:00.000Z'),
});

describe('MongoWebinaireRepository', () => {
  async function createWebinaireInDatabase(webinaire: Webinaire) {
    const record = new model({
      _id: webinaire.props.id,
      organizerId: webinaire.props.organizerId,
      title: webinaire.props.title,
      seats: webinaire.props.seats,
      startDate: webinaire.props.startDate,
      endDate: webinaire.props.endDate,
    });

    await record.save();
  }
  let app: TestApp;
  let model: Model<MongoWebinaire.SchemaClass>;
  let repository: MongoWebinaireRepository;

  beforeEach(async () => {
    app = new TestApp();
    await app.setup();

    model = app.get<Model<MongoWebinaire.SchemaClass>>(
      getModelToken(MongoWebinaire.CollectionName),
    );

    repository = new MongoWebinaireRepository(model);

    await createWebinaireInDatabase(cleanArchitectureWebinaire);
  });

  describe('findById', () => {
    it('should find the webinaire corresponding to the id', async () => {
      const webinaire = await repository.findById(
        cleanArchitectureWebinaire.props.id,
      );

      expect(webinaire!.props).toEqual(cleanArchitectureWebinaire.props);
    });

    it('should return null when the id is not assigned', async () => {
      const webinaire = await repository.findById('does-not-exist');
      expect(webinaire).toEqual(null);
    });
  });

  describe('create', () => {
    it('should create the webinaire', async () => {
      await repository.create(cqrsWebinaire);

      const record = await model.findById(cqrsWebinaire.props.id);
      expect(record?.toObject()).toEqual({
        __v: 0,
        _id: cqrsWebinaire.props.id,
        organizerId: cqrsWebinaire.props.organizerId,
        title: cqrsWebinaire.props.title,
        seats: cqrsWebinaire.props.seats,
        startDate: cqrsWebinaire.props.startDate,
        endDate: cqrsWebinaire.props.endDate,
      });
    });
  });

  describe('update', () => {
    it('should update the webinaire', async () => {
      await createWebinaireInDatabase(cqrsWebinaire);

      const cqrsCopy = cqrsWebinaire.clone() as Webinaire;
      cqrsCopy.update({
        title: 'CQRS - Command Query Responsibility Segregation',
        seats: 100,
        startDate: new Date('2024-01-01T00:00:00.000Z'),
        endDate: new Date('2024-01-01T02:00:00.000Z'),
      });

      await repository.update(cqrsCopy);

      const record = await model.findById(cqrsWebinaire.props.id);
      expect(record?.toObject()).toEqual({
        __v: 0,
        _id: cqrsCopy.props.id,
        organizerId: cqrsCopy.props.organizerId,
        title: cqrsCopy.props.title,
        seats: cqrsCopy.props.seats,
        startDate: cqrsCopy.props.startDate,
        endDate: cqrsCopy.props.endDate,
      });

      expect(cqrsCopy.props).toEqual(cqrsCopy.initialState);
    });
  });

  describe('delete', () => {
    it('should delete the webinaire', async () => {
      await repository.delete(cleanArchitectureWebinaire);

      const record = await model.findById(cleanArchitectureWebinaire.props.id);
      expect(record).toEqual(null);
    });
  });

  afterEach(async () => {
    await app.cleanup();
  });
});
