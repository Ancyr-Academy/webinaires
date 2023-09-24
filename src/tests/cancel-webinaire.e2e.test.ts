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

describe('Feature: canceling the webinaire', () => {
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
      const id = 'id-1';

      const result = await request(app.getHttpServer())
        .delete(`/webinaires/${id}`)
        .set('Authorization', e2eUsers.johnDoe.createAuthorizationToken());

      expect(result.status).toBe(200);

      const webinaireRepository = app.get<IWebinaireRepository>(
        I_WEBINAIRE_REPOSITORY,
      );

      const webinaire = await webinaireRepository.findById(id);
      expect(webinaire).toBeNull();
    });
  });

  describe('Scenario: the user is not authenticated', () => {
    it('should reject', async () => {
      const id = 'id-1';

      const result = await request(app.getHttpServer()).delete(
        `/webinaires/${id}`,
      );

      expect(result.status).toBe(403);
    });
  });
});
