import { InMemoryMailer } from '../../core/adapters/in-memory-mailer';
import { InMemoryUserRepository } from '../../users/adapters/in-memory-user-repository';
import { testUsers } from '../../users/tests/user-seeds';
import { InMemoryParticipationRepository } from '../adapters/in-memory-participation-repository';
import { InMemoryWebinaireRepository } from '../adapters/in-memory-webinaire-repository';
import { Participation } from '../entities/participation.entity';
import { Webinaire } from '../entities/webinaire.entity';
import { CancelWebinaire } from './cancel-webinaire';

describe('Feature: canceling a webinaire', () => {
  function expectWebinaireToBeDeleted() {
    const storedWebinaire = webinaireRepository.findByIdSync(
      webinaire.props.id,
    );

    expect(storedWebinaire).toBeNull();
  }

  function expectWebinaireNotToBeDeleted() {
    const storedWebinaire = webinaireRepository.findByIdSync(
      webinaire.props.id,
    );

    expect(storedWebinaire).not.toBeNull();
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
  let mailer: InMemoryMailer;
  let participationRepository: InMemoryParticipationRepository;
  let userRepository: InMemoryUserRepository;
  let useCase: CancelWebinaire;

  beforeEach(async () => {
    webinaireRepository = new InMemoryWebinaireRepository([webinaire]);
    mailer = new InMemoryMailer();
    participationRepository = new InMemoryParticipationRepository([
      bobParticipation,
    ]);
    userRepository = new InMemoryUserRepository([
      testUsers.alice,
      testUsers.bob,
    ]);

    useCase = new CancelWebinaire(
      webinaireRepository,
      mailer,
      participationRepository,
      userRepository,
    );
  });

  describe('Scenario: happy path', () => {
    const payload = {
      user: testUsers.alice,
      webinaireId: webinaire.props.id,
    };

    it('should delete the webinaire', async () => {
      await useCase.execute(payload);

      expectWebinaireToBeDeleted();
    });

    it('should send an e-mail to the participants', async () => {
      await useCase.execute(payload);

      expect(mailer.sentEmails).toEqual([
        {
          to: testUsers.bob.props.emailAddress,
          subject: 'Webinaire canceled',
          body: `The webinaire "My first webinaire" has been canceled.`,
        },
      ]);
    });
  });

  describe('Scenario: webinaire does not exist', () => {
    it('should fail', async () => {
      await expect(() =>
        useCase.execute({
          user: testUsers.alice,
          webinaireId: 'random-id',
        }),
      ).rejects.toThrowError('Webinaire not found');

      expectWebinaireNotToBeDeleted();
    });
  });

  describe('Scenario: deleting the webinaire of someone else', () => {
    it('should fail', async () => {
      await expect(() =>
        useCase.execute({
          user: testUsers.bob,
          webinaireId: webinaire.props.id,
        }),
      ).rejects.toThrowError('You are not allowed to update this webinaire');

      expectWebinaireNotToBeDeleted();
    });
  });
});
