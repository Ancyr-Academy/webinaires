import { differenceInDays } from 'date-fns';
import { Entity } from '../../shared/entity';
import { User } from '../../users/entities/user.entity';

type WebinaireProps = {
  id: string;
  organizerId: string;
  title: string;
  seats: number;
  startDate: Date;
  endDate: Date;
};

export class Webinaire extends Entity<WebinaireProps> {
  isTooClose(now: Date): boolean {
    const diff = differenceInDays(this.props.startDate, now);
    return diff < 3;
  }

  hasTooManySeats(): boolean {
    return this.props.seats > 1000;
  }

  hasNoSeats(): boolean {
    return this.props.seats < 1;
  }

  isOrganizer(user: User): boolean {
    return this.props.organizerId === user.props.id;
  }
}
