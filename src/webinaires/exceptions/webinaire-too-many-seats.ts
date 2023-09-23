import { DomainException } from '../../shared/exception';

export class WebinaireTooManySeatsException extends DomainException {
  constructor() {
    super('The webinaire must have a maximum of 1000 seats');
  }
}
