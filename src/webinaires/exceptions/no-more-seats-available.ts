import { DomainException } from '../../shared/exception';

export class NoMoreSeatAvailable extends DomainException {
  constructor() {
    super('No more seats available');
  }
}
