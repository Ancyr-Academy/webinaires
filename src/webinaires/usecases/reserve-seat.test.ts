import { InMemoryMailer } from '../../core/adapters/in-memory-mailer';
import { InMemoryUserRepository } from '../../users/adapters/in-memory-user-repository';
import { testUsers } from '../../users/tests/user-seeds';
import { InMemoryParticipationRepository } from '../adapters/in-memory-participation-repository';
import { InMemoryWebinaireRepository } from '../adapters/in-memory-webinaire-repository';
import { Participation } from '../entities/participation.entity';
import { Webinaire } from '../entities/webinaire.entity';
import { ReserveSeat } from './reserve-seat';

describe('Feature: reserving a seat', () => {
  function expectParticipationNotToBeCreated() {
    const storedParticipation = participationRepository.findOneSync(
      testUsers.bob.props.id,
      webinaire.props.id,
    );

    expect(storedParticipation).toBeNull();
  }

  function expectParticipationToBeCreated() {
    const storedParticipation = participationRepository.findOneSync(
      testUsers.bob.props.id,
      webinaire.props.id,
    );

    expect(storedParticipation).not.toBeNull();
  }

  const webinaire = new Webinaire({
    id: 'id-1',
    organizerId: 'alice',
    title: 'My first webinaire',
    seats: 50,
    startDate: new Date('2023-01-10T10:00:00.000Z'),
    endDate: new Date('2023-01-10T11:00:00.000Z'),
  });

  const webinaireWithFewSeats = new Webinaire({
    id: 'id-2',
    organizerId: 'alice',
    title: 'My first webinaire',
    seats: 1,
    startDate: new Date('2023-01-10T10:00:00.000Z'),
    endDate: new Date('2023-01-10T11:00:00.000Z'),
  });

  const charlesParticipation = new Participation({
    userId: 'charles',
    webinaireId: webinaireWithFewSeats.props.id,
  });

  let participationRepository: InMemoryParticipationRepository;
  let mailer: InMemoryMailer;
  let webinaireRepository: InMemoryWebinaireRepository;
  let userRepository: InMemoryUserRepository;
  let useCase: ReserveSeat;

  beforeEach(async () => {
    participationRepository = new InMemoryParticipationRepository([
      charlesParticipation,
    ]);
    mailer = new InMemoryMailer();
    webinaireRepository = new InMemoryWebinaireRepository([
      webinaire,
      webinaireWithFewSeats,
    ]);
    userRepository = new InMemoryUserRepository([
      testUsers.alice,
      testUsers.bob,
      testUsers.charles,
    ]);

    useCase = new ReserveSeat(
      participationRepository,
      mailer,
      webinaireRepository,
      userRepository,
    );
  });

  describe('Scenario: happy path', () => {
    const payload = {
      user: testUsers.bob,
      webinaireId: webinaire.props.id,
    };

    it('should reserve a seat', async () => {
      await useCase.execute(payload);

      expectParticipationToBeCreated();
    });

    it('should send an e-mail to the organizer', async () => {
      await useCase.execute(payload);

      expect(mailer.sentEmails[0]).toEqual({
        to: testUsers.alice.props.emailAddress,
        subject: 'New participation',
        body: `A new user has reserved a seat for your webinaire "${webinaire.props.title}".`,
      });
    });

    it('should send an e-mail to the participant', async () => {
      await useCase.execute(payload);

      expect(mailer.sentEmails[1]).toEqual({
        to: testUsers.bob.props.emailAddress,
        subject: 'Your participation to a webinaire',
        body: `You have reserved a seat for the webinaire "${webinaire.props.title}".`,
      });
    });
  });

  describe('Scenario: the webinaire does not exist', () => {
    const payload = {
      user: testUsers.bob,
      webinaireId: 'random-id',
    };

    it('should fail', async () => {
      await expect(() => useCase.execute(payload)).rejects.toThrowError(
        'Webinaire not found',
      );

      expectParticipationNotToBeCreated();
    });
  });

  describe('Scenario: the webinaire does not have enough seats', () => {
    const payload = {
      user: testUsers.bob,
      webinaireId: webinaireWithFewSeats.props.id,
    };

    it('should fail', async () => {
      await expect(() => useCase.execute(payload)).rejects.toThrowError(
        'No more seats available',
      );

      expectParticipationNotToBeCreated();
    });
  });

  describe('Scenario: the user already participates in the webinaire', () => {
    const payload = {
      user: testUsers.charles,
      webinaireId: webinaireWithFewSeats.props.id,
    };

    it('should fail', async () => {
      await expect(() => useCase.execute(payload)).rejects.toThrowError(
        'You already participate in this webinaire',
      );

      expectParticipationNotToBeCreated();
    });
  });
});
