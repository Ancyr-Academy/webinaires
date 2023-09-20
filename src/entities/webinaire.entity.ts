import { differenceInDays } from 'date-fns';

type WebinaireProps = {
  id: string;
  title: string;
  seats: number;
  startDate: Date;
  endDate: Date;
};

export class Webinaire {
  constructor(public props: WebinaireProps) {}

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
}
