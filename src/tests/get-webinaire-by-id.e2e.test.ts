import * as request from 'supertest';
import { e2eUsers } from './seeds/user-seeds.e2e';
import { e2eWebinaires } from './seeds/webinaire-seeds.e2e';
import { TestApp } from './utils/test-app';

describe('Feature: getting a webinaire by its ID', () => {
  let app: TestApp;

  beforeEach(async () => {
    app = new TestApp();
    await app.setup();
    await app.loadFixtures([e2eUsers.johnDoe, e2eWebinaires.webinaire1]);
  });

  afterEach(async () => {
    await app.cleanup();
  });

  describe('Scenario: happy path', () => {
    it('should succeed', async () => {
      const webinaire = e2eWebinaires.webinaire1.entity;
      const organizer = e2eUsers.johnDoe.entity;

      const id = webinaire.props.id;

      const result = await request(app.getHttpServer())
        .get(`/webinaires/${id}`)
        .set('Authorization', e2eUsers.johnDoe.createAuthorizationToken());

      expect(result.status).toBe(200);
      expect(result.body).toEqual({
        id: webinaire.props.id,
        title: webinaire.props.title,
        startDate: webinaire.props.startDate.toISOString(),
        endDate: webinaire.props.endDate.toISOString(),
        organizer: {
          id: organizer.props.id,
          emailAddress: organizer.props.emailAddress,
        },
        seats: {
          reserved: 0,
          available: webinaire.props.seats,
        },
      });
    });
  });

  describe('Scenario: the user is not authenticated', () => {
    it('should reject', async () => {
      const id = e2eWebinaires.webinaire1.entity.props.id;
      const result = await request(app.getHttpServer()).get(
        `/webinaires/${id}`,
      );

      expect(result.status).toBe(403);
    });
  });
});
