import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  Request,
} from '@nestjs/common';
import { ZodValidationPipe } from '../../core/pipes/zod-validation.pipe';
import { User } from '../../users/entities/user.entity';
import { WebinaireAPI } from '../contract';
import {
  GetWebinaireByIdQuery,
  I_GET_WEBINAIRE_BY_ID_QUERY,
} from '../ports/get-webinaire-by-id-query.interface';
import { CancelWebinaire } from '../usecases/cancel-webinaire';
import { ChangeDates } from '../usecases/change-dates';
import { ChangeSeats } from '../usecases/change-seats';
import { OrganizeWebinaire } from '../usecases/organize-webinaire';

@Controller()
export class WebinaireController {
  constructor(
    private readonly organizeWebinaire: OrganizeWebinaire,
    private readonly changeSeats: ChangeSeats,
    private readonly changeDates: ChangeDates,
    private readonly cancelWebinaire: CancelWebinaire,
    @Inject(I_GET_WEBINAIRE_BY_ID_QUERY)
    private readonly getWebinaireById: GetWebinaireByIdQuery,
  ) {}

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

  @Get('/webinaires/:id')
  async handleGetWebinaireById(
    @Param('id') id: string,
  ): Promise<WebinaireAPI.GetWebinaire.Response> {
    return this.getWebinaireById.execute(id);
  }

  @HttpCode(200)
  @Post('/webinaires/:id/seats')
  async handleChangeSeats(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(WebinaireAPI.ChangeSeats.schema))
    body: WebinaireAPI.ChangeSeats.Request,
    @Request() request: { user: User },
  ): Promise<WebinaireAPI.ChangeSeats.Response> {
    return this.changeSeats.execute({
      user: request.user,
      webinaireId: id,
      seats: body.seats,
    });
  }

  @HttpCode(200)
  @Post('/webinaires/:id/dates')
  async handleChangeDates(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(WebinaireAPI.ChangeDates.schema))
    body: WebinaireAPI.ChangeDates.Request,
    @Request() request: { user: User },
  ): Promise<WebinaireAPI.ChangeDates.Response> {
    return this.changeDates.execute({
      user: request.user,
      webinaireId: id,
      startDate: body.startDate,
      endDate: body.endDate,
    });
  }

  @Delete('/webinaires/:id')
  async handleCancelWebinaire(
    @Param('id') id: string,
    @Request() request: { user: User },
  ): Promise<WebinaireAPI.CancelWebinaire.Response> {
    return this.cancelWebinaire.execute({
      user: request.user,
      webinaireId: id,
    });
  }
}
