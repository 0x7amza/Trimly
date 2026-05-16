import { Router, RequestHandler } from 'express';
import { BookingController } from '@presentation/controllers/BookingController';
import { requireBarberAuth } from '@presentation/middlewares/clerkAuth';
import { requireCustomerAuth } from '@presentation/middlewares/customerAuth';
import { validate } from '@presentation/middlewares/validate';
import {
  getAvailabilitySchema,
  createOnlineBookingSchema,
  createManualBookingSchema,
  updateBookingStatusSchema,
} from '@presentation/validators/booking.validators';

export function createBookingRoutes(
  controller: BookingController,
  subscriptionGuardBarber: RequestHandler,
  subscriptionGuardCustomer: RequestHandler,
): Router {
  const router = Router();

  // Public: View available slots
  router.get(
    '/barber/:clerkId/availability',
    validate(getAvailabilitySchema),
    controller.getAvailability,
  );

  // Customer: Create online booking (requires JWT + active subscription on target barber's shop)
  router.post(
    '/online',
    requireCustomerAuth,
    validate(createOnlineBookingSchema),
    subscriptionGuardCustomer,
    controller.createOnline,
  );

  // Barber: Create manual booking (requires Clerk + active subscription)
  router.post(
    '/manual',
    requireBarberAuth,
    validate(createManualBookingSchema),
    subscriptionGuardBarber,
    controller.createManual,
  );

  // Barber: View their schedule
  router.get(
    '/me/barber',
    requireBarberAuth,
    controller.getMyBookingsAsBarber,
  );

  // Customer: View their bookings
  router.get(
    '/me/customer',
    requireCustomerAuth,
    controller.getMyBookingsAsCustomer,
  );

  // Barber: Update booking status
  router.patch(
    '/:id/status',
    requireBarberAuth,
    validate(updateBookingStatusSchema),
    controller.updateStatus,
  );

  return router;
}
