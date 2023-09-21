import { FixedDateGenerator } from '../adapters/fixed-date-generator';
import { FixedIDGenerator } from '../adapters/fixed-id-generator';
import { InMemoryWebinaireRepository } from '../adapters/in-memory-webinaire-repository';
import { Webinaire } from '../entities/webinaire.entity';
import { OrganizeWebinaire } from './organize-webinaire';

describe('Feature: organizing a webinaire', () => {
  function expectWebinaireToEqual(webinaire: Webinaire) {
    expect(webinaire.props).toEqual({
      id: 'id-1',
      title: 'My first webinaire',
      seats: 100,
      startDate: new Date('2023-01-10T10:00:00.000Z'),
      endDate: new Date('2023-01-10T11:00:00.000Z'),
    });
  }

  let repository: InMemoryWebinaireRepository;
  let idGenerator: FixedIDGenerator;
  let dateGenerator: FixedDateGenerator;
  let useCase: OrganizeWebinaire;

  beforeEach(() => {
    repository = new InMemoryWebinaireRepository();
    idGenerator = new FixedIDGenerator();
    dateGenerator = new FixedDateGenerator();
    useCase = new OrganizeWebinaire(repository, idGenerator, dateGenerator);
  });

  describe('Scenario: happy path', () => {
    const payload = {
      title: 'My first webinaire',
      seats: 100,
      startDate: new Date('2023-01-10T10:00:00.000Z'),
      endDate: new Date('2023-01-10T11:00:00.000Z'),
    };

    it('should return the ID', async () => {
      const result = await useCase.execute(payload);

      expect(result.id).toEqual('id-1');
    });

    it('should insert the webinaire into the database', async () => {
      await useCase.execute(payload);

      expect(repository.database.length).toBe(1);

      const createdWebinaire = repository.database[0];
      expectWebinaireToEqual(createdWebinaire);
    });
  });

  describe('Scenario: the webinaire happens too soon', () => {
    const payload = {
      title: 'My first webinaire',
      seats: 100,
      startDate: new Date('2023-01-03T23:59:59.000Z'),
      endDate: new Date('2023-01-03T23:59:59.000Z'),
    };

    it('should throw an error', async () => {
      await expect(() => useCase.execute(payload)).rejects.toThrowError(
        'The webinaire must happen in at least 3 days',
      );
    });

    it('should not create a webinaire', async () => {
      try {
        await useCase.execute(payload);
      } catch (e) {}

      expect(repository.database.length).toBe(0);
    });
  });

  describe('Scenario: the webinaire has too many seats', () => {
    const payload = {
      title: 'My first webinaire',
      seats: 1001,
      startDate: new Date('2023-01-10T10:00:00.000Z'),
      endDate: new Date('2023-01-10T11:00:00.000Z'),
    };

    it('should throw an error', async () => {
      await expect(() => useCase.execute(payload)).rejects.toThrowError(
        'The webinaire must have a maximum of 1000 seats',
      );
    });

    it('should not create a webinaire', async () => {
      try {
        await useCase.execute(payload);
      } catch (e) {}

      expect(repository.database.length).toBe(0);
    });
  });

  describe('Scenario: the webinaire does not have enough seats', () => {
    const payload = {
      title: 'My first webinaire',
      seats: 0,
      startDate: new Date('2023-01-10T10:00:00.000Z'),
      endDate: new Date('2023-01-10T11:00:00.000Z'),
    };

    it('should throw an error', async () => {
      await expect(() => useCase.execute(payload)).rejects.toThrowError(
        'The webinaire must at least have 1 seat',
      );
    });

    it('should not create a webinaire', async () => {
      try {
        await useCase.execute(payload);
      } catch (e) {}

      expect(repository.database.length).toBe(0);
    });
  });
});
