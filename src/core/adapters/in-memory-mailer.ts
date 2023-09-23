import { Email, IMailer } from '../ports/mailer.interface';

export class InMemoryMailer implements IMailer {
  public readonly sentEmails: Email[] = [];

  async send(email: Email): Promise<void> {
    this.sentEmails.push(email);
  }
}
