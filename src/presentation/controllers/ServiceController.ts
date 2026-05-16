import { Request, Response } from 'express';
import { asyncHandler } from '@shared/utils/asyncHandler';
import { CreateServiceUseCase } from '@application/use-cases/service/CreateServiceUseCase';
import { GetBarberServicesUseCase } from '@application/use-cases/service/GetBarberServicesUseCase';
import { UpdateServiceUseCase } from '@application/use-cases/service/UpdateServiceUseCase';
import { DeleteServiceUseCase } from '@application/use-cases/service/DeleteServiceUseCase';

export class ServiceController {
  constructor(
    private createUseCase: CreateServiceUseCase,
    private getServicesUseCase: GetBarberServicesUseCase,
    private updateUseCase: UpdateServiceUseCase,
    private deleteUseCase: DeleteServiceUseCase,
  ) {}

  create = asyncHandler(async (req: Request, res: Response) => {
    const service = await this.createUseCase.execute({
      barberId: req.barberClerkId!,
      ...req.body,
    });
    res.status(201).json({ success: true, data: service });
  });

  getByBarber = asyncHandler(async (req: Request, res: Response) => {
    const services = await this.getServicesUseCase.execute(req.params.clerkId as string);
    res.status(200).json({ success: true, data: services });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const service = await this.updateUseCase.execute(
      req.params.id as string,
      req.barberClerkId!,
      req.body,
    );
    res.status(200).json({ success: true, data: service });
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await this.deleteUseCase.execute(req.params.id as string, req.barberClerkId!);
    res.status(200).json({ success: true, message: 'Service deleted' });
  });
}
