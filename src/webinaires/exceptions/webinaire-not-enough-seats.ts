import { DomainException } from '../../shared/exception';

export class WebinaireNotEnoughSeatsException extends DomainException {
  constructor() {
    super('The webinaire must at least have 1 seat');
  }
}
