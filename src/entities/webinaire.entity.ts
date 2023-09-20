type WebinaireProps = {
  id: string;
  title: string;
  seats: number;
  startDate: Date;
  endDate: Date;
};

export class Webinaire {
  constructor(public props: WebinaireProps) {}
}
