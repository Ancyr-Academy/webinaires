import { IDateGenerator } from '../ports/date-generator.interface';

export class CurrentDateGenerator implements IDateGenerator {
  now(): Date {
    return new Date();
  }
}
