import { User } from '../../users/entities/user.entity';
import { UserFixture } from '../fixtures/user-fixture';

export const e2eUsers = {
  johnDoe: new UserFixture(
    new User({
      id: 'john-doe',
      emailAddress: 'johndoe@gmail.com',
      password: 'azerty',
    }),
  ),
};
