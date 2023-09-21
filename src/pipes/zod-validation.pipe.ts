import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { z } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: z.Schema<any>) {}

  transform(payload: any) {
    const result = this.schema.safeParse(payload);
    if (result.success === true) {
      return result.data;
    }

    throw new BadRequestException('Failed to validate');
  }
}
