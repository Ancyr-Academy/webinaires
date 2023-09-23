import { testUsers } from '../../users/tests/user-seeds';
import { InMemoryWebinaireRepository } from '../adapters/in-memory-webinaire-repository';
import { Webinaire } from '../entities/webinaire.entity';
import { ChangeSeats } from './change-seats';

describe('Feature: changing the number of seats', () => {
  function expectSeatsToRemainUnchanged() {
    const webinaire = webinaireRepository.findByIdSync('id-1');
    expect(webinaire!.props.seats).toEqual(50);
  }

  const webinaire = new Webinaire({
    id: 'id-1',
    organizerId: 'alice',
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
    const payload = {
      user: testUsers.alice,
      webinaireId: 'id-1',
      seats: 100,
    };

    it('should change the number of seats', async () => {
      await useCase.execute(payload);

      const webinaire = await webinaireRepository.findById('id-1');
      expect(webinaire!.props.seats).toEqual(100);
    });
  });

  describe('Scenario: webinaire does not exist', () => {
    const payload = {
      user: testUsers.alice,
      webinaireId: 'id-2',
      seats: 100,
    };

    it('should fail', async () => {
      await expect(useCase.execute(payload)).rejects.toThrow(
        'Webinaire not found',
      );

      expectSeatsToRemainUnchanged();
    });
  });

  describe('Scenario: updating the webinaire of someone else', () => {
    const payload = {
      user: testUsers.bob,
      webinaireId: 'id-1',
      seats: 100,
    };

    it('should fail', async () => {
      await expect(useCase.execute(payload)).rejects.toThrow(
        'You are not allowed to update this webinaire',
      );

      expectSeatsToRemainUnchanged();
    });
  });

  describe('Scenario: reducing the number of seats', () => {
    const payload = {
      user: testUsers.alice,
      webinaireId: 'id-1',
      seats: 49,
    };

    it('should fail', async () => {
      await expect(useCase.execute(payload)).rejects.toThrow(
        'You cannot reduce the number of seats',
      );

      expectSeatsToRemainUnchanged();
    });
  });

  describe('Scenario: reducing the number of seats', () => {
    const payload = {
      user: testUsers.alice,
      webinaireId: 'id-1',
      seats: 1001,
    };
    it('should fail', async () => {
      await expect(useCase.execute(payload)).rejects.toThrow(
        'The webinaire must have a maximum of 1000 seats',
      );

      expectSeatsToRemainUnchanged();
    });
  });
});
