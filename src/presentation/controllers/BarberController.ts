import { Request, Response } from 'express';
import { asyncHandler } from '@shared/utils/asyncHandler';
import { SyncBarberUseCase } from '@application/use-cases/barber/SyncBarberUseCase';
import { GetBarberProfileUseCase } from '@application/use-cases/barber/GetBarberProfileUseCase';
import { UpdateBarberProfileUseCase } from '@application/use-cases/barber/UpdateBarberProfileUseCase';

export class BarberController {
  constructor(
    private syncUseCase: SyncBarberUseCase,
    private getProfileUseCase: GetBarberProfileUseCase,
    private updateProfileUseCase: UpdateBarberProfileUseCase,
  ) {}

  sync = asyncHandler(async (req: Request, res: Response) => {
    const barber = await this.syncUseCase.execute({
      clerkId: req.barberClerkId!,
      name: req.body.name,
      email: req.body.email,
    });
    res.status(200).json({ success: true, data: barber });
  });

  getProfile = asyncHandler(async (req: Request, res: Response) => {
    const barber = await this.getProfileUseCase.execute(req.barberClerkId!);
    res.status(200).json({ success: true, data: barber });
  });

  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const barber = await this.updateProfileUseCase.execute(req.barberClerkId!, req.body);
    res.status(200).json({ success: true, data: barber });
  });
}
