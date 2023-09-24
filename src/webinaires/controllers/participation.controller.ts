import { Controller, Param, Post, Request } from '@nestjs/common';
import { User } from '../../users/entities/user.entity';
import { WebinaireAPI } from '../contract';
import { ReserveSeat } from '../usecases/reserve-seat';

@Controller()
export class ParticipationController {
  constructor(private readonly reserveSeat: ReserveSeat) {}

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
}
