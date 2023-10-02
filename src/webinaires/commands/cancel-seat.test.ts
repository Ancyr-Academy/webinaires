import { InMemoryMailer } from '../../core/adapters/in-memory-mailer';
import { InMemoryUserRepository } from '../../users/adapters/in-memory-user-repository';
import { testUsers } from '../../users/tests/user-seeds';
import { InMemoryParticipationRepository } from '../adapters/in-memory-participation-repository';
import { InMemoryWebinaireRepository } from '../adapters/in-memory-webinaire-repository';
import { Participation } from '../entities/participation.entity';
import { Webinaire } from '../entities/webinaire.entity';
import { CancelSeat } from './cancel-seat';

describe('Feature: canceling a seat', () => {
  function expectParticipationNotToBeDeleted() {
    const storedParticipation = participationRepository.findOneSync(
      testUsers.bob.props.id,
      webinaire.props.id,
    );

    expect(storedParticipation).not.toBeNull();
  }

  function expectParticipationToBeDeleted() {
    const storedParticipation = participationRepository.findOneSync(
      testUsers.bob.props.id,
      webinaire.props.id,
    );

    expect(storedParticipation).toBeNull();
  }

  const webinaire = new Webinaire({
    id: 'id-1',
    organizerId: 'alice',
    title: 'My first webinaire',
    seats: 50,
    startDate: new Date('2023-01-10T10:00:00.000Z'),
    endDate: new Date('2023-01-10T11:00:00.000Z'),
  });

  const bobParticipation = new Participation({
    userId: testUsers.bob.props.id,
    webinaireId: webinaire.props.id,
  });

  let webinaireRepository: InMemoryWebinaireRepository;
  let participationRepository: InMemoryParticipationRepository;
  let userRepository: InMemoryUserRepository;
  let mailer: InMemoryMailer;
  let useCase: CancelSeat;

  beforeEach(async () => {
    webinaireRepository = new InMemoryWebinaireRepository([webinaire]);
    participationRepository = new InMemoryParticipationRepository([
      bobParticipation,
    ]);
    userRepository = new InMemoryUserRepository([
      testUsers.alice,
      testUsers.bob,
    ]);
    mailer = new InMemoryMailer();
    useCase = new CancelSeat(
      webinaireRepository,
      participationRepository,
      userRepository,
      mailer,
    );
  });

  describe('Scenario: happy path', () => {
    const payload = {
      user: testUsers.bob,
      webinaireId: webinaire.props.id,
    };

    it('should cancel the seat', async () => {
      await useCase.execute(payload);

      expectParticipationToBeDeleted();
    });

    it('should send an e-mail to the organizer', async () => {
      await useCase.execute(payload);

      expect(mailer.sentEmails[0]).toEqual({
        to: testUsers.alice.props.emailAddress,
        subject: 'A participant has canceled their seat',
        body: `A participant has canceled their seat for the webinaire "${webinaire.props.title}".`,
      });
    });

    it('should send an e-mail to the participant', async () => {
      await useCase.execute(payload);

      expect(mailer.sentEmails[1]).toEqual({
        to: testUsers.bob.props.emailAddress,
        subject: 'Your participation cancellation',
        body: `You have canceled your participation to the webinaire "${webinaire.props.title}".`,
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

      expectParticipationNotToBeDeleted();
    });
  });

  describe('Scenario: the user did not reserve a seat', () => {
    const payload = {
      user: testUsers.charles,
      webinaireId: webinaire.props.id,
    };

    it('should fail', async () => {
      await expect(() => useCase.execute(payload)).rejects.toThrowError(
        'Participation not found',
      );

      expectParticipationNotToBeDeleted();
    });
  });
});
