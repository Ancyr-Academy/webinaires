import { Body, Controller, Get, Post } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { OrganizeWebinaire } from '../usecases/organize-webinaire';
import { AppService } from './app.service';

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
  async handleOrganizeWebinaire(@Body() body: any) {
    return this.organizeWebinaire.execute({
      user: new User({
        id: 'john-doe',
      }),
      title: body.title,
      seats: body.seats,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
    });
  }
}
