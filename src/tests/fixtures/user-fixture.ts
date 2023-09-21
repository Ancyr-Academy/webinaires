import { User } from '../../users/entities/user.entity';
import {
  IUserRepository,
  I_USER_REPOSITORY,
} from '../../users/ports/user-repository.interface';
import { IFixture } from '../utils/fixture';
import { TestApp } from '../utils/test-app';

export class UserFixture implements IFixture {
  constructor(public entity: User) {}

  async load(app: TestApp): Promise<void> {
    const userRepository = app.get<IUserRepository>(I_USER_REPOSITORY);
    await userRepository.create(this.entity);
  }

  createAuthorizationToken() {
    return (
      'Basic ' +
      Buffer.from(
        `${this.entity.props.emailAddress}:${this.entity.props.password}`,
      ).toString('base64')
    );
  }
}
