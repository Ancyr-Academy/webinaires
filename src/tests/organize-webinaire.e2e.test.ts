import { addDays } from 'date-fns';
import * as request from 'supertest';
import {
  IWebinaireRepository,
  I_WEBINAIRE_REPOSITORY,
} from '../webinaires/ports/webinaire-repository.interface';
import { TestApp } from './utils/test-app';
import { e2eUsers } from './seeds/user-seeds';

describe('Feature: organizing a webinaire', () => {
  let app: TestApp;

  beforeEach(async () => {
    app = new TestApp();
    await app.setup();
    await app.loadFixtures([e2eUsers.johnDoe]);
  });

  afterEach(async () => {
    await app.cleanup();
  });

  describe('Scenario: happy path', () => {
    it('should create the webinaire', async () => {
      const startDate = addDays(new Date(), 4);
      const endDate = addDays(new Date(), 5);

      const result = await request(app.getHttpServer())
        .post('/webinaires')
        .set('Authorization', e2eUsers.johnDoe.createAuthorizationToken())
        .send({
          title: 'My first webinaire',
          seats: 100,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        });

      expect(result.status).toBe(201);
      expect(result.body).toEqual({ id: expect.any(String) });

      const webinaireRepository = app.get<IWebinaireRepository>(
        I_WEBINAIRE_REPOSITORY,
      );
      const webinaire = await webinaireRepository.findById(result.body.id);

      expect(webinaire).toBeDefined();
      expect(webinaire!.props).toEqual({
        id: result.body.id,
        organizerId: 'john-doe',
        title: 'My first webinaire',
        seats: 100,
        startDate,
        endDate,
      });
    });
  });

  describe('Scenario: the user is not authenticated', () => {
    it('should reject', async () => {
      const result = await request(app.getHttpServer())
        .post('/webinaires')
        .send({
          title: 'My first webinaire',
          seats: 100,
          startDate: addDays(new Date(), 4).toISOString(),
          endDate: addDays(new Date(), 5).toISOString(),
        });

      expect(result.status).toBe(403);
    });
  });
});
