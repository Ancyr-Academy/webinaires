import { FixedIDGenerator } from '../adapters/fixed-id-generator';
import { InMemoryWebinaireRepository } from '../adapters/in-memory-webinaire-repository';
import { OrganizeWebinaire } from './organize-webinaire';

describe('Feature: organizing a webinaire', () => {
  let repository: InMemoryWebinaireRepository;
  let idGenerator: FixedIDGenerator;
  let useCase: OrganizeWebinaire;

  beforeEach(() => {
    repository = new InMemoryWebinaireRepository();
    idGenerator = new FixedIDGenerator();
    useCase = new OrganizeWebinaire(repository, idGenerator);
  });

  describe('Scenario: happy path', () => {
    it('should return the ID', async () => {
      const result = await useCase.execute({
        title: 'My first webinaire',
        seats: 100,
        startDate: new Date('2023-01-10T10:00:00.000Z'),
        endDate: new Date('2023-01-10T11:00:00.000Z'),
      });

      expect(result.id).toEqual('id-1');
    });

    it('should insert the webinaire into the database', async () => {
      await useCase.execute({
        title: 'My first webinaire',
        seats: 100,
        startDate: new Date('2023-01-10T10:00:00.000Z'),
        endDate: new Date('2023-01-10T11:00:00.000Z'),
      });

      expect(repository.database.length).toBe(1);

      const createdWebinaire = repository.database[0];
      expect(createdWebinaire.props).toEqual({
        id: 'id-1',
        title: 'My first webinaire',
        seats: 100,
        startDate: new Date('2023-01-10T10:00:00.000Z'),
        endDate: new Date('2023-01-10T11:00:00.000Z'),
      });
    });
  });
});
