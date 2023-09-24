import { User } from '../entities/user.entity';

export const testUsers = {
  alice: new User({
    id: 'alice',
    emailAddress: 'alice@gmail.com',
    password: 'azerty',
  }),

  bob: new User({
    id: 'bob',
    emailAddress: 'bob@gmail.com',
    password: 'azerty',
  }),

  charles: new User({
    id: 'charles',
    emailAddress: 'charles@gmail.com',
    password: 'azerty',
  }),
};
