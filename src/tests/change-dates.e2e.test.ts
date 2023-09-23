import { addDays } from 'date-fns';
import * as request from 'supertest';
import { Webinaire } from '../webinaires/entities/webinaire.entity';
import {
  IWebinaireRepository,
  I_WEBINAIRE_REPOSITORY,
} from '../webinaires/ports/webinaire-repository.interface';
import { WebinaireFixture } from './fixtures/webinaire-fixture';
import { e2eUsers } from './seeds/user-seeds.e2e';
import { TestApp } from './utils/test-app';

describe('Feature: changing the number of dates', () => {
  let app: TestApp;

  beforeEach(async () => {
    app = new TestApp();
    await app.setup();
    await app.loadFixtures([
      e2eUsers.johnDoe,
      new WebinaireFixture(
        new Webinaire({
          id: 'id-1',
          organizerId: e2eUsers.johnDoe.entity.props.id,
          seats: 50,
          title: 'My first webinaire',
          startDate: addDays(new Date(), 4),
          endDate: addDays(new Date(), 5),
        }),
      ),
    ]);
  });

  afterEach(async () => {
    await app.cleanup();
  });

  describe('Scenario: happy path', () => {
    it('should succeed', async () => {
      const startDate = addDays(new Date(), 5);
      const endDate = addDays(new Date(), 6);
      const id = 'id-1';

      const result = await request(app.getHttpServer())
        .post(`/webinaires/${id}/dates`)
        .set('Authorization', e2eUsers.johnDoe.createAuthorizationToken())
        .send({
          startDate,
          endDate,
        });

      expect(result.status).toBe(200);

      const webinaireRepository = app.get<IWebinaireRepository>(
        I_WEBINAIRE_REPOSITORY,
      );
      const webinaire = await webinaireRepository.findById(id);

      expect(webinaire).toBeDefined();
      expect(webinaire!.props.startDate).toEqual(startDate);
      expect(webinaire!.props.endDate).toEqual(endDate);
    });
  });

  describe('Scenario: the user is not authenticated', () => {
    it('should reject', async () => {
      const startDate = addDays(new Date(), 5);
      const endDate = addDays(new Date(), 6);
      const id = 'id-1';

      const result = await request(app.getHttpServer())
        .post(`/webinaires/${id}/dates`)
        .send({
          startDate,
          endDate,
        });

      expect(result.status).toBe(403);
    });
  });
});
