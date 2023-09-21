import { Test } from '@nestjs/testing';
import { addDays } from 'date-fns';
import * as request from 'supertest';
import { AppModule } from '../app/app.module';

describe('Feature: organizing a webinaire', () => {
  it('should organize the webinaire', async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const app = module.createNestApplication();
    await app.init();

    const result = await request(app.getHttpServer())
      .post('/webinaires')
      .send({
        title: 'My first webinaire',
        seats: 100,
        startDate: addDays(new Date(), 4).toISOString(),
        endDate: addDays(new Date(), 5).toISOString(),
      });

    expect(result.status).toBe(201);
    expect(result.body).toEqual({ id: expect.any(String) });
  });
});
