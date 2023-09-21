import { Body, Controller, Post, Request } from '@nestjs/common';
import { ZodValidationPipe } from '../../core/pipes/zod-validation.pipe';
import { User } from '../../users/entities/user.entity';
import { WebinaireAPI } from '../contract';
import { OrganizeWebinaire } from '../usecases/organize-webinaire';

@Controller()
export class WebinaireController {
  constructor(private readonly organizeWebinaire: OrganizeWebinaire) {}

  @Post('/webinaires')
  async handleOrganizeWebinaire(
    @Body(new ZodValidationPipe(WebinaireAPI.OrganizeWebinaire.schema))
    body: WebinaireAPI.OrganizeWebinaire.Request,
    @Request() request: { user: User },
  ): Promise<WebinaireAPI.OrganizeWebinaire.Response> {
    return this.organizeWebinaire.execute({
      user: request.user,
      title: body.title,
      seats: body.seats,
      startDate: body.startDate,
      endDate: body.endDate,
    });
  }
}
