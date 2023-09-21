import { User } from '../entities/user.entity';
import { IUserRepository } from '../ports/user-repository.interface';

export interface IAuthenticator {
  authenticate(token: string): Promise<User>;
}

export class Authenticator implements IAuthenticator {
  constructor(private readonly userRepository: IUserRepository) {}

  async authenticate(token: string): Promise<User> {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [emailAddress, password] = decoded.split(':');

    const user = await this.userRepository.findByEmailAddress(emailAddress);

    if (user === null) {
      throw new Error('User not found');
    }

    if (user.props.password !== password) {
      throw new Error('Password invalid');
    }

    return user;
  }
}
