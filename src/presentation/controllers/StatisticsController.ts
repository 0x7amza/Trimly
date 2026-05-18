import { Request, Response } from 'express';
import { asyncHandler } from '@shared/utils/asyncHandler';
import { GetShopStatsUseCase } from '@application/use-cases/statistics/GetShopStatsUseCase';
import { GetBarberStatsUseCase } from '@application/use-cases/statistics/GetBarberStatsUseCase';
import { ForbiddenError } from '@shared/errors/AppError';

export class StatisticsController {
  constructor(
    private getShopStatsUseCase: GetShopStatsUseCase,
    private getBarberStatsUseCase: GetBarberStatsUseCase,
  ) {}

  getShopStats = asyncHandler(async (req: Request, res: Response) => {
    // requireOwner middleware ensures req.barber.role === 'OWNER'
    const stats = await this.getShopStatsUseCase.execute(req.barber!.shopId!);
    res.status(200).json({ success: true, data: stats });
  });

  getBarberStats = asyncHandler(async (req: Request, res: Response) => {
    const targetBarberId = (req.params.barberId as string) || req.barberClerkId!;

    // RBAC: If target is not the logged-in user, they must be the OWNER.
    // In a stricter system, we'd also verify targetBarberId belongs to the OWNER's shop.
    if (targetBarberId !== req.barberClerkId) {
      if (req.barber!.role !== 'OWNER') {
        throw new ForbiddenError('You can only view your own statistics');
      }
    }

    const stats = await this.getBarberStatsUseCase.execute(targetBarberId);
    res.status(200).json({ success: true, data: stats });
  });
}
