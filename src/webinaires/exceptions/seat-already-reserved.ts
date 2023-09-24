import { DomainException } from '../../shared/exception';

export class SeatAlreadyReservedException extends DomainException {
  constructor() {
    super('You already participate in this webinaire');
  }
}
