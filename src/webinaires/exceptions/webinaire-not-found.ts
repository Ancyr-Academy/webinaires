import { DomainException } from '../../shared/exception';

export class WebinaireNotFoundException extends DomainException {
  constructor() {
    super('Webinaire not found');
  }
}
