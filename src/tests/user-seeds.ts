import { User } from '../entities/user.entity';
import { UserFixture } from './user-fixture';

export const e2eUsers = {
  johnDoe: new UserFixture(
    new User({
      id: 'john-doe',
      emailAddress: 'johndoe@gmail.com',
      password: 'azerty',
    }),
  ),
};
