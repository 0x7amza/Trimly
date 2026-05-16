import { IBookingRepository } from '@domain/repositories/IBookingRepository';
import { IBooking } from '@domain/entities/Booking';
import { BookingModel } from '../models/BookingModel';

export class MongoBookingRepository implements IBookingRepository {
  async findById(id: string): Promise<IBooking | null> {
    const doc = await BookingModel.findById(id).lean();
    return doc ? this.toEntity(doc) : null;
  }

  async findByBarberAndDateRange(
    barberId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<IBooking[]> {
    const docs = await BookingModel.find({
      barberId,
      status: { $ne: 'CANCELLED' },
      startTime: { $gte: startDate },
      endTime: { $lte: endDate },
    })
      .sort({ startTime: 1 })
      .lean();

    return docs.map((doc) => this.toEntity(doc));
  }

  async findOverlapping(
    barberId: string,
    startTime: Date,
    endTime: Date,
  ): Promise<IBooking[]> {
    // A booking overlaps if: existingStart < requestedEnd AND existingEnd > requestedStart
    const docs = await BookingModel.find({
      barberId,
      status: { $nin: ['CANCELLED'] },
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    }).lean();

    return docs.map((doc) => this.toEntity(doc));
  }

  async findByCustomerId(customerId: string): Promise<IBooking[]> {
    const docs = await BookingModel.find({
      customerId,
      startTime: { $gte: new Date() },
      status: { $ne: 'CANCELLED' },
    })
      .sort({ startTime: 1 })
      .lean();

    return docs.map((doc) => this.toEntity(doc));
  }

  async findByBarberId(barberId: string): Promise<IBooking[]> {
    const docs = await BookingModel.find({
      barberId,
      startTime: { $gte: new Date() },
      status: { $ne: 'CANCELLED' },
    })
      .sort({ startTime: 1 })
      .lean();

    return docs.map((doc) => this.toEntity(doc));
  }

  async findByPaymentIntentId(paymentIntentId: string): Promise<IBooking | null> {
    const doc = await BookingModel.findOne({ paymentIntentId }).lean();
    return doc ? this.toEntity(doc) : null;
  }

  async create(booking: Partial<IBooking>): Promise<IBooking> {
    const doc = await BookingModel.create(booking);
    return this.toEntity(doc.toObject());
  }

  async update(id: string, data: Partial<IBooking>): Promise<IBooking | null> {
    const doc = await BookingModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, lean: true },
    );
    return doc ? this.toEntity(doc) : null;
  }

  private toEntity(doc: any): IBooking {
    return {
      id: doc._id.toString(),
      barberId: doc.barberId,
      customerId: doc.customerId,
      serviceId: doc.serviceId,
      startTime: doc.startTime,
      endTime: doc.endTime,
      status: doc.status,
      paymentStatus: doc.paymentStatus,
      paymentIntentId: doc.paymentIntentId,
      isManual: doc.isManual,
      notes: doc.notes,
      customerName: doc.customerName,
      customerPhone: doc.customerPhone,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
