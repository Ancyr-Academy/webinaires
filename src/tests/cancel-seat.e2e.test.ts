import * as request from 'supertest';
import { Participation } from '../webinaires/entities/participation.entity';
import {
  IParticipationRepository,
  I_PARTICIPATION_REPOSITORY,
} from '../webinaires/ports/participation-repository.interface';
import { ParticipationFixture } from './fixtures/participation-fixture';
import { e2eUsers } from './seeds/user-seeds.e2e';
import { e2eWebinaires } from './seeds/webinaire-seeds.e2e';
import { TestApp } from './utils/test-app';

describe('Feature: canceling a seat', () => {
  let app: TestApp;

  beforeEach(async () => {
    app = new TestApp();
    await app.setup();
    await app.loadFixtures([
      e2eUsers.johnDoe,
      e2eUsers.bob,
      e2eWebinaires.webinaire1,
      new ParticipationFixture(
        new Participation({
          userId: e2eUsers.bob.entity.props.id,
          webinaireId: e2eWebinaires.webinaire1.entity.props.id,
        }),
      ),
    ]);
  });

  afterEach(async () => {
    await app.cleanup();
  });

  describe('Scenario: happy path', () => {
    it('should succeed', async () => {
      const id = e2eWebinaires.webinaire1.entity.props.id;

      const result = await request(app.getHttpServer())
        .delete(`/webinaires/${id}/participations`)
        .set('Authorization', e2eUsers.bob.createAuthorizationToken());

      expect(result.status).toBe(200);

      const participationRepository = app.get<IParticipationRepository>(
        I_PARTICIPATION_REPOSITORY,
      );

      const participation = await participationRepository.findOne(
        e2eUsers.bob.entity.props.id,
        id,
      );

      expect(participation).toBeNull();
    });
  });

  describe('Scenario: the user is not authenticated', () => {
    it('should reject', async () => {
      const id = e2eWebinaires.webinaire1.entity.props.id;

      const result = await request(app.getHttpServer()).delete(
        `/webinaires/${id}/participations`,
      );

      expect(result.status).toBe(403);
    });
  });
});
