import { Request, Response } from 'express';
import { asyncHandler } from '@shared/utils/asyncHandler';
import { CreateServiceUseCase } from '@application/use-cases/service/CreateServiceUseCase';
import { GetBarberServicesUseCase } from '@application/use-cases/service/GetBarberServicesUseCase';
import { UpdateServiceUseCase } from '@application/use-cases/service/UpdateServiceUseCase';
import { DeleteServiceUseCase } from '@application/use-cases/service/DeleteServiceUseCase';
import { ForbiddenError } from '@shared/errors/AppError';

export class ServiceController {
  constructor(
    private createUseCase: CreateServiceUseCase,
    private getServicesUseCase: GetBarberServicesUseCase,
    private updateUseCase: UpdateServiceUseCase,
    private deleteUseCase: DeleteServiceUseCase,
  ) {}

  create = asyncHandler(async (req: Request, res: Response) => {
    const targetBarberId = req.body.barberId || req.barberClerkId!;
    if (targetBarberId !== req.barberClerkId && req.barber!.role !== 'OWNER') {
      throw new ForbiddenError('You can only create services for yourself');
    }

    const service = await this.createUseCase.execute({
      barberId: targetBarberId,
      ...req.body,
    });
    res.status(201).json({ success: true, data: service });
  });

  getByBarber = asyncHandler(async (req: Request, res: Response) => {
    const services = await this.getServicesUseCase.execute(req.params.clerkId as string);
    res.status(200).json({ success: true, data: services });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    // Note: UpdateServiceUseCase should ideally check if the service belongs to the barber.
    // For now we assume req.barberClerkId! owns it, but an owner can update any.
    // We pass req.barber to let the use case handle it if necessary, or just rely on barberId.
    const targetBarberId = req.body.barberId || req.barberClerkId!;
    if (targetBarberId !== req.barberClerkId && req.barber!.role !== 'OWNER') {
      throw new ForbiddenError('You can only update your own services');
    }

    const service = await this.updateUseCase.execute(
      req.params.id as string,
      targetBarberId,
      req.body,
    );
    res.status(200).json({ success: true, data: service });
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const targetBarberId = req.query.barberId ? String(req.query.barberId) : req.barberClerkId!;
    if (targetBarberId !== req.barberClerkId && req.barber!.role !== 'OWNER') {
      throw new ForbiddenError('You can only delete your own services');
    }

    await this.deleteUseCase.execute(req.params.id as string, targetBarberId);
    res.status(200).json({ success: true, message: 'Service deleted' });
  });
}
