import { Request, Response } from 'express';
import { asyncHandler } from '@shared/utils/asyncHandler';
import { CalculateAvailabilityUseCase } from '@application/use-cases/booking/CalculateAvailabilityUseCase';
import { CreateOnlineBookingUseCase } from '@application/use-cases/booking/CreateOnlineBookingUseCase';
import { CreateManualBookingUseCase } from '@application/use-cases/booking/CreateManualBookingUseCase';
import { GetMyBookingsUseCase } from '@application/use-cases/booking/GetMyBookingsUseCase';
import { UpdateBookingStatusUseCase } from '@application/use-cases/booking/UpdateBookingStatusUseCase';

export class BookingController {
  constructor(
    private availabilityUseCase: CalculateAvailabilityUseCase,
    private createOnlineUseCase: CreateOnlineBookingUseCase,
    private createManualUseCase: CreateManualBookingUseCase,
    private getBookingsUseCase: GetMyBookingsUseCase,
    private updateStatusUseCase: UpdateBookingStatusUseCase,
  ) {}

  getAvailability = asyncHandler(async (req: Request, res: Response) => {
    const slots = await this.availabilityUseCase.execute({
      barberId: req.params.clerkId as string,
      serviceId: req.query.serviceId as string,
      date: req.query.date as string,
    });
    res.status(200).json({ success: true, data: slots });
  });

  createOnline = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.createOnlineUseCase.execute({
      barberId: req.body.barberId,
      customerId: req.customerId!,
      serviceId: req.body.serviceId,
      startTime: req.body.startTime,
    });
    res.status(201).json({ success: true, data: result });
  });

  createManual = asyncHandler(async (req: Request, res: Response) => {
    const booking = await this.createManualUseCase.execute({
      barberId: req.barberClerkId!,
      ...req.body,
    });
    res.status(201).json({ success: true, data: booking });
  });

  getMyBookingsAsBarber = asyncHandler(async (req: Request, res: Response) => {
    const bookings = await this.getBookingsUseCase.executeForBarber(req.barberClerkId!);
    res.status(200).json({ success: true, data: bookings });
  });

  getMyBookingsAsCustomer = asyncHandler(async (req: Request, res: Response) => {
    const bookings = await this.getBookingsUseCase.executeForCustomer(req.customerId!);
    res.status(200).json({ success: true, data: bookings });
  });

  updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const booking = await this.updateStatusUseCase.execute({
      bookingId: req.params.id as string,
      barberId: req.barberClerkId!,
      newStatus: req.body.status,
    });
    res.status(200).json({ success: true, data: booking });
  });
}
