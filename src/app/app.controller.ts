import { Body, Controller, Get, Post } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';
import { OrganizeWebinaire } from '../usecases/organize-webinaire';
import { AppService } from './app.service';
import { WebinaireAPI } from './contract';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly organizeWebinaire: OrganizeWebinaire,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('/webinaires')
  async handleOrganizeWebinaire(
    @Body(new ZodValidationPipe(WebinaireAPI.OrganizeWebinaire.schema))
    body: WebinaireAPI.OrganizeWebinaire.Request,
  ): Promise<WebinaireAPI.OrganizeWebinaire.Response> {
    return this.organizeWebinaire.execute({
      user: new User({
        id: 'john-doe',
      }),
      title: body.title,
      seats: body.seats,
      startDate: body.startDate,
      endDate: body.endDate,
    });
  }
}
