import * as request from 'supertest';
import {
  IParticipationRepository,
  I_PARTICIPATION_REPOSITORY,
} from '../webinaires/ports/participation-repository.interface';
import { e2eUsers } from './seeds/user-seeds.e2e';
import { e2eWebinaires } from './seeds/webinaire-seeds.e2e';
import { TestApp } from './utils/test-app';

describe('Feature: reserving a seat', () => {
  let app: TestApp;

  beforeEach(async () => {
    app = new TestApp();
    await app.setup();
    await app.loadFixtures([
      e2eUsers.johnDoe,
      e2eUsers.bob,
      e2eWebinaires.webinaire1,
    ]);
  });

  afterEach(async () => {
    await app.cleanup();
  });

  describe('Scenario: happy path', () => {
    it('should succeed', async () => {
      const id = e2eWebinaires.webinaire1.entity.props.id;

      const result = await request(app.getHttpServer())
        .post(`/webinaires/${id}/participations`)
        .set('Authorization', e2eUsers.bob.createAuthorizationToken());

      expect(result.status).toBe(201);

      const webinaireRepository = app.get<IParticipationRepository>(
        I_PARTICIPATION_REPOSITORY,
      );

      const participation = await webinaireRepository.findOne(
        id,
        e2eUsers.bob.entity.props.id,
      );

      expect(participation).toBeNull();
    });
  });

  describe('Scenario: the user is not authenticated', () => {
    it('should reject', async () => {
      const id = e2eWebinaires.webinaire1.entity.props.id;

      const result = await request(app.getHttpServer()).post(
        `/webinaires/${id}/participations`,
      );

      expect(result.status).toBe(403);
    });
  });
});
