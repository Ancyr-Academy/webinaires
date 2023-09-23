import { differenceInDays } from 'date-fns';

type WebinaireProps = {
  id: string;
  organizerId: string;
  title: string;
  seats: number;
  startDate: Date;
  endDate: Date;
};

export class Webinaire {
  public initialState: WebinaireProps;
  public props: WebinaireProps;

  constructor(data: WebinaireProps) {
    this.initialState = { ...data };
    this.props = { ...data };

    Object.freeze(this.initialState);
  }

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

  update(data: Partial<WebinaireProps>): void {
    this.props = { ...this.props, ...data };
  }

  commit(): void {
    this.initialState = this.props;
  }
}
