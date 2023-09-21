import { IDateGenerator } from '../ports/date-generator.interface';

export class FixedDateGenerator implements IDateGenerator {
  now(): Date {
    return new Date('2023-01-01T00:00:00.000Z');
  }
}
