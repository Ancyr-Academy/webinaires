import { DomainException } from '../../shared/exception';

export class WebinaireTooEarlyException extends DomainException {
  constructor() {
    super('The webinaire must happen in at least 3 days');
  }
}
