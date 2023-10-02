import { Controller, Delete, Param, Post, Request } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { User } from '../../users/entities/user.entity';
import { CancelSeat } from '../commands/cancel-seat';
import { ReserveSeatCommand } from '../commands/reserve-seat';
import { WebinaireAPI } from '../contract';

@Controller()
export class ParticipationController {
  constructor(
    private readonly cancelSeat: CancelSeat,
    private readonly commandBus: CommandBus,
  ) {}

  @Post('/webinaires/:id/participations')
  async handleReserveSeat(
    @Param('id') id: string,
    @Request() request: { user: User },
  ): Promise<WebinaireAPI.ReserveSeat.Response> {
    return this.commandBus.execute(new ReserveSeatCommand(request.user, id));
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
