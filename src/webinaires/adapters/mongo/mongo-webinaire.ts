import {
  Schema as MongooseSchema,
  Prop,
  SchemaFactory,
} from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export namespace MongoWebinaire {
  export const CollectionName = 'webinaires';

  @MongooseSchema({ collection: CollectionName })
  export class SchemaClass {
    @Prop({ type: String })
    _id: string;

    @Prop()
    organizerId: string;

    @Prop()
    title: string;

    @Prop()
    seats: number;

    @Prop()
    startDate: Date;

    @Prop()
    endDate: Date;
  }

  export const Schema = SchemaFactory.createForClass(SchemaClass);
  export type Document = HydratedDocument<SchemaClass>;
}
