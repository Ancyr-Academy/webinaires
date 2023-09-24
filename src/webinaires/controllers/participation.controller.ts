import { Controller, Delete, Param, Post, Request } from '@nestjs/common';
import { User } from '../../users/entities/user.entity';
import { WebinaireAPI } from '../contract';
import { CancelSeat } from '../usecases/cancel-seat';
import { ReserveSeat } from '../usecases/reserve-seat';

@Controller()
export class ParticipationController {
  constructor(
    private readonly reserveSeat: ReserveSeat,
    private readonly cancelSeat: CancelSeat,
  ) {}

  @Post('/webinaires/:id/participations')
  async handleReserveSeat(
    @Param('id') id: string,
    @Request() request: { user: User },
  ): Promise<WebinaireAPI.ReserveSeat.Response> {
    return this.reserveSeat.execute({
      user: request.user,
      webinaireId: id,
    });
  }

  @Delete('/webinaires/:id/participations')
  async handleCancelSeat(
    @Param('id') id: string,
    @Request() request: { user: User },
  ): Promise<WebinaireAPI.CancelSeat.Response> {
    return this.cancelSeat.execute({
      user: request.user,
      webinaireId: id,
    });
  }
}
