import { DomainException } from '../../shared/exception';

export class ParticipationNotFoundException extends DomainException {
  constructor() {
    super('Participation not found');
  }
}
