import { User } from '../../users/entities/user.entity';
import { InMemoryWebinaireRepository } from '../adapters/in-memory-webinaire-repository';
import { Webinaire } from '../entities/webinaire.entity';
import { ChangeSeats } from './change-seats';

describe('Feature: changing the number of seats', () => {
  function expectSeatsToRemainUnchanged() {
    const webinaire = webinaireRepository.findByIdSync('id-1');
    expect(webinaire!.props.seats).toEqual(50);
  }

  const johnDoe = new User({
    id: 'john-doe',
    emailAddress: 'johndoe@gmail.com',
    password: 'azerty',
  });

  const bob = new User({
    id: 'bob',
    emailAddress: 'bob@gmail.com',
    password: 'azerty',
  });

  const webinaire = new Webinaire({
    id: 'id-1',
    organizerId: 'john-doe',
    title: 'My first webinaire',
    seats: 50,
    startDate: new Date('2023-01-10T10:00:00.000Z'),
    endDate: new Date('2023-01-10T11:00:00.000Z'),
  });

  let webinaireRepository: InMemoryWebinaireRepository;
  let useCase: ChangeSeats;

  beforeEach(async () => {
    webinaireRepository = new InMemoryWebinaireRepository([webinaire]);
    useCase = new ChangeSeats(webinaireRepository);
  });

  describe('Scenario: happy path', () => {
    it('should change the number of seats', async () => {
      await useCase.execute({
        user: johnDoe,
        webinaireId: 'id-1',
        seats: 100,
      });

      const webinaire = await webinaireRepository.findById('id-1');
      expect(webinaire!.props.seats).toEqual(100);
    });
  });

  describe('Scenario: webinaire does not exist', () => {
    it('should fail', async () => {
      await expect(
        useCase.execute({
          user: johnDoe,
          webinaireId: 'id-2',
          seats: 100,
        }),
      ).rejects.toThrow('Webinaire not found');

      expectSeatsToRemainUnchanged();
    });
  });

  describe('Scenario: updating the webinaire of someone else', () => {
    it('should fail', async () => {
      await expect(
        useCase.execute({
          user: bob,
          webinaireId: 'id-1',
          seats: 100,
        }),
      ).rejects.toThrow('You are not allowed to update this webinaire');

      expectSeatsToRemainUnchanged();
    });
  });

  describe('Scenario: reducing the number of seats', () => {
    it('should fail', async () => {
      await expect(
        useCase.execute({
          user: johnDoe,
          webinaireId: 'id-1',
          seats: 49,
        }),
      ).rejects.toThrow('You cannot reduce the number of seats');

      expectSeatsToRemainUnchanged();
    });
  });

  describe('Scenario: reducing the number of seats', () => {
    it('should fail', async () => {
      await expect(
        useCase.execute({
          user: johnDoe,
          webinaireId: 'id-1',
          seats: 1001,
        }),
      ).rejects.toThrow('The webinaire must have a maximum of 1000 seats');

      expectSeatsToRemainUnchanged();
    });
  });
});
