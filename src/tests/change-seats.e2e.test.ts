import * as request from 'supertest';
import { Webinaire } from '../webinaires/entities/webinaire.entity';
import {
  IWebinaireRepository,
  I_WEBINAIRE_REPOSITORY,
} from '../webinaires/ports/webinaire-repository.interface';
import { WebinaireFixture } from './fixtures/webinaire-fixture';
import { e2eUsers } from './seeds/user-seeds';
import { TestApp } from './utils/test-app';

describe('Feature: changing the number of seats', () => {
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
          startDate: new Date('2023-01-10T10:00:00.000Z'),
          endDate: new Date('2023-01-10T11:00:00.000Z'),
        }),
      ),
    ]);
  });

  afterEach(async () => {
    await app.cleanup();
  });

  describe('Scenario: happy path', () => {
    it('should create the webinaire', async () => {
      const seats = 100;
      const id = 'id-1';

      const result = await request(app.getHttpServer())
        .post(`/webinaires/${id}/seats`)
        .set('Authorization', e2eUsers.johnDoe.createAuthorizationToken())
        .send({
          seats,
        });

      expect(result.status).toBe(200);

      const webinaireRepository = app.get<IWebinaireRepository>(
        I_WEBINAIRE_REPOSITORY,
      );
      const webinaire = await webinaireRepository.findById(id);

      expect(webinaire).toBeDefined();
      expect(webinaire!.props.seats).toEqual(seats);
    });
  });

  describe('Scenario: the user is not authenticated', () => {
    it('should reject', async () => {
      const seats = 100;
      const id = 'id-1';

      const result = await request(app.getHttpServer())
        .post(`/webinaires/${id}/seats`)
        .send({
          seats,
        });

      expect(result.status).toBe(403);
    });
  });
});
