import { FixedDateGenerator } from '../../core/adapters/fixed-date-generator';
import { InMemoryMailer } from '../../core/adapters/in-memory-mailer';
import { InMemoryUserRepository } from '../../users/adapters/in-memory-user-repository';
import { testUsers } from '../../users/tests/user-seeds';
import { InMemoryParticipationRepository } from '../adapters/in-memory-participation-repository';
import { InMemoryWebinaireRepository } from '../adapters/in-memory-webinaire-repository';
import { Participation } from '../entities/participation.entity';
import { Webinaire } from '../entities/webinaire.entity';
import { ChangeDates } from './change-dates';

describe('Feature: changing the dates of a webinaire', () => {
  function expectDatesToRemainUnchanged() {
    const updatedWebinaire = webinaireRepository.findByIdSync('id-1')!;
    expect(updatedWebinaire.props.startDate).toEqual(webinaire.props.startDate);
    expect(updatedWebinaire.props.endDate).toEqual(webinaire.props.endDate);
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
  let dateGenerator: FixedDateGenerator;
  let participationRepository: InMemoryParticipationRepository;
  let mailer: InMemoryMailer;
  let userRepository: InMemoryUserRepository;
  let useCase: ChangeDates;

  beforeEach(async () => {
    webinaireRepository = new InMemoryWebinaireRepository([webinaire]);
    dateGenerator = new FixedDateGenerator();
    participationRepository = new InMemoryParticipationRepository([
      bobParticipation,
    ]);
    mailer = new InMemoryMailer();
    userRepository = new InMemoryUserRepository([
      testUsers.alice,
      testUsers.bob,
    ]);

    useCase = new ChangeDates(
      webinaireRepository,
      dateGenerator,
      participationRepository,
      mailer,
      userRepository,
    );
  });

  describe('Scenario: happy path', () => {
    const payload = {
      user: testUsers.alice,
      webinaireId: 'id-1',
      startDate: new Date('2023-01-20T07:00:00.000Z'),
      endDate: new Date('2023-01-21T08:00:00.000Z'),
    };

    it('should change the dates', async () => {
      await useCase.execute(payload);

      const updatedWebinaire = webinaireRepository.findByIdSync('id-1')!;
      expect(updatedWebinaire.props.startDate).toEqual(payload.startDate);
      expect(updatedWebinaire.props.endDate).toEqual(payload.endDate);
    });

    it('should send an e-mail to the participants', async () => {
      await useCase.execute(payload);

      expect(mailer.sentEmails).toEqual([
        {
          to: testUsers.bob.props.emailAddress,
          subject: 'Dates of the webinaire "My first webinaire" have changed',
          body: `The dates of the webinaire "My first webinaire" have changed.`,
        },
      ]);
    });
  });

  describe('Scenario: webinaire does not exist', () => {
    const payload = {
      user: testUsers.alice,
      webinaireId: 'not-existent-webinaire',
      startDate: new Date('2023-01-20T07:00:00.000Z'),
      endDate: new Date('2023-01-21T08:00:00.000Z'),
    };

    it('should fail', async () => {
      await expect(() => useCase.execute(payload)).rejects.toThrow(
        'Webinaire not found',
      );

      expectDatesToRemainUnchanged();
    });
  });

  describe('Scenario: updating the webinaire of someone else', () => {
    const payload = {
      user: testUsers.bob,
      webinaireId: 'id-1',
      startDate: new Date('2023-01-20T07:00:00.000Z'),
      endDate: new Date('2023-01-21T08:00:00.000Z'),
    };

    it('should fail', async () => {
      await expect(() => useCase.execute(payload)).rejects.toThrow(
        'You are not allowed to update this webinaire',
      );

      expectDatesToRemainUnchanged();
    });
  });

  describe('Scenario: updating the webinaire of someone else', () => {
    const payload = {
      user: testUsers.alice,
      webinaireId: 'id-1',
      startDate: new Date('2023-01-03T00:00:00.000Z'),
      endDate: new Date('2023-01-03T01:00:00.000Z'),
    };

    it('should fail', async () => {
      await expect(() => useCase.execute(payload)).rejects.toThrow(
        'The webinaire must happen in at least 3 days',
      );

      expectDatesToRemainUnchanged();
    });
  });
});
