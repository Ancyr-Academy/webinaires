import { Entity } from '../../shared/entity';

type Props = {
  userId: string;
  webinaireId: string;
};

export class Participation extends Entity<Props> {}
