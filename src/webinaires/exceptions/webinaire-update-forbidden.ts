import { DomainException } from '../../shared/exception';

export class WebinaireUpdateForbiddenException extends DomainException {
  constructor() {
    super('You are not allowed to update this webinaire');
  }
}
