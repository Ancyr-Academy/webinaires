import { Model } from 'mongoose';
import { User } from '../../entities/user.entity';
import { IUserRepository } from '../../ports/user-repository.interface';
import { MongoUser } from './mongo-user';

export class MongoUserRepository implements IUserRepository {
  private mapper = new UserMapper();

  constructor(private readonly model: Model<MongoUser.SchemaClass>) {}

  async findByEmailAddress(emailAddress: string): Promise<User | null> {
    const user = await this.model.findOne({ emailAddress });
    if (!user) {
      return null;
    }

    return this.mapper.toCore(user);
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.model.findById(id);
    if (!user) {
      return null;
    }

    return this.mapper.toCore(user);
  }

  async create(user: User): Promise<void> {
    const record = new this.model(this.mapper.toPersistence(user));
    await record.save();
  }
}

class UserMapper {
  toCore(user: MongoUser.Document): User {
    return new User({
      id: user._id,
      emailAddress: user.emailAddress,
      password: user.password,
    });
  }

  toPersistence(user: User): MongoUser.SchemaClass {
    return {
      _id: user.props.id,
      emailAddress: user.props.emailAddress,
      password: user.props.password,
    };
  }
}
