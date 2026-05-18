import { Router } from 'express';

// Repositories
import { MongoBarberRepository } from '@infrastructure/database/repositories/MongoBarberRepository';
import { MongoCustomerRepository } from '@infrastructure/database/repositories/MongoCustomerRepository';
import { MongoServiceRepository } from '@infrastructure/database/repositories/MongoServiceRepository';
import { MongoBookingRepository } from '@infrastructure/database/repositories/MongoBookingRepository';
import { MongoShopRepository } from '@infrastructure/database/repositories/MongoShopRepository';

// Services
import { TwilioOtpService } from '@infrastructure/services/TwilioOtpService';
import { StripePaymentService } from '@infrastructure/services/StripePaymentService';

// Use Cases — Auth
import { SendOtpUseCase } from '@application/use-cases/auth/SendOtpUseCase';
import { VerifyOtpUseCase } from '@application/use-cases/auth/VerifyOtpUseCase';
import { RegisterCustomerUseCase } from '@application/use-cases/auth/RegisterCustomerUseCase';
import { LoginCustomerUseCase } from '@application/use-cases/auth/LoginCustomerUseCase';

// Use Cases — Barber
import { SyncBarberUseCase } from '@application/use-cases/barber/SyncBarberUseCase';
import { GetBarberProfileUseCase } from '@application/use-cases/barber/GetBarberProfileUseCase';
import { UpdateBarberProfileUseCase } from '@application/use-cases/barber/UpdateBarberProfileUseCase';

// Use Cases — Shop
import { CreateShopUseCase } from '@application/use-cases/shop/CreateShopUseCase';
import { GetShopUseCase } from '@application/use-cases/shop/GetShopUseCase';
import { AddBarberToShopUseCase } from '@application/use-cases/shop/AddBarberToShopUseCase';

// Use Cases — Subscription
import { CreateSubscriptionCheckoutUseCase } from '@application/use-cases/subscription/CreateSubscriptionCheckoutUseCase';
import { CreateBillingPortalUseCase } from '@application/use-cases/subscription/CreateBillingPortalUseCase';
import { HandleSubscriptionWebhookUseCase } from '@application/use-cases/subscription/HandleSubscriptionWebhookUseCase';

// Use Cases — Service
import { CreateServiceUseCase } from '@application/use-cases/service/CreateServiceUseCase';
import { GetBarberServicesUseCase } from '@application/use-cases/service/GetBarberServicesUseCase';
import { UpdateServiceUseCase } from '@application/use-cases/service/UpdateServiceUseCase';
import { DeleteServiceUseCase } from '@application/use-cases/service/DeleteServiceUseCase';

// Use Cases — Booking
import { CalculateAvailabilityUseCase } from '@application/use-cases/booking/CalculateAvailabilityUseCase';
import { CreateOnlineBookingUseCase } from '@application/use-cases/booking/CreateOnlineBookingUseCase';
import { CreateManualBookingUseCase } from '@application/use-cases/booking/CreateManualBookingUseCase';
import { GetMyBookingsUseCase } from '@application/use-cases/booking/GetMyBookingsUseCase';
import { UpdateBookingStatusUseCase } from '@application/use-cases/booking/UpdateBookingStatusUseCase';

// Use Cases — Statistics
import { GetShopStatsUseCase } from '@application/use-cases/statistics/GetShopStatsUseCase';
import { GetBarberStatsUseCase } from '@application/use-cases/statistics/GetBarberStatsUseCase';

// Use Cases — Payment
import { HandleStripeWebhookUseCase } from '@application/use-cases/payment/HandleStripeWebhookUseCase';

// Controllers
import { AuthController } from '@presentation/controllers/AuthController';
import { BarberController } from '@presentation/controllers/BarberController';
import { ShopController } from '@presentation/controllers/ShopController';
import { ServiceController } from '@presentation/controllers/ServiceController';
import { BookingController } from '@presentation/controllers/BookingController';
import { PaymentController } from '@presentation/controllers/PaymentController';
import { StatisticsController } from '@presentation/controllers/StatisticsController';

// Middlewares
import { createSubscriptionGuard } from '@presentation/middlewares/subscriptionGuard';

// Route Factories
import { createAuthRoutes } from './auth.routes';
import { createBarberRoutes } from './barber.routes';
import { createShopRoutes } from './shop.routes';
import { createServiceRoutes } from './service.routes';
import { createBookingRoutes } from './booking.routes';
import { createPaymentRoutes } from './payment.routes';
import { createStatisticsRoutes } from './statistics.routes';

/**
 * Composition Root — wires all dependencies together.
 * This is the only place where concrete implementations are instantiated.
 */
export function createApiRouter(): Router {
  const router = Router();

  // ── Instantiate Repositories ──
  const barberRepo = new MongoBarberRepository();
  const customerRepo = new MongoCustomerRepository();
  const serviceRepo = new MongoServiceRepository();
  const bookingRepo = new MongoBookingRepository();
  const shopRepo = new MongoShopRepository();

  // ── Instantiate External Services ──
  const otpService = new TwilioOtpService();
  const paymentService = new StripePaymentService();

  // ── Instantiate Subscription Guard Middlewares ──
  const subscriptionGuardBarber = createSubscriptionGuard(barberRepo, shopRepo, 'barber');
  const subscriptionGuardCustomer = createSubscriptionGuard(barberRepo, shopRepo, 'customer');

  // ── Instantiate Use Cases ──
  const sendOtpUseCase = new SendOtpUseCase(otpService, customerRepo);
  const verifyOtpUseCase = new VerifyOtpUseCase(otpService, customerRepo);
  const registerUseCase = new RegisterCustomerUseCase(customerRepo);
  const loginUseCase = new LoginCustomerUseCase(customerRepo);

  const syncBarberUseCase = new SyncBarberUseCase(barberRepo, shopRepo);
  const getBarberProfileUseCase = new GetBarberProfileUseCase(barberRepo);
  const updateBarberProfileUseCase = new UpdateBarberProfileUseCase(barberRepo);

  const createShopUseCase = new CreateShopUseCase(shopRepo, barberRepo);
  const getShopUseCase = new GetShopUseCase(shopRepo, barberRepo);
  const addBarberUseCase = new AddBarberToShopUseCase(shopRepo, barberRepo);

  const subscriptionCheckoutUseCase = new CreateSubscriptionCheckoutUseCase(shopRepo, barberRepo, paymentService);
  const billingPortalUseCase = new CreateBillingPortalUseCase(shopRepo, barberRepo, paymentService);
  const subscriptionWebhookUseCase = new HandleSubscriptionWebhookUseCase(shopRepo, paymentService);

  const createServiceUseCase = new CreateServiceUseCase(serviceRepo);
  const getBarberServicesUseCase = new GetBarberServicesUseCase(serviceRepo);
  const updateServiceUseCase = new UpdateServiceUseCase(serviceRepo);
  const deleteServiceUseCase = new DeleteServiceUseCase(serviceRepo);

  const availabilityUseCase = new CalculateAvailabilityUseCase(bookingRepo, barberRepo, serviceRepo);
  const createOnlineBookingUseCase = new CreateOnlineBookingUseCase(bookingRepo, serviceRepo, paymentService);
  const createManualBookingUseCase = new CreateManualBookingUseCase(bookingRepo, serviceRepo);
  const getMyBookingsUseCase = new GetMyBookingsUseCase(bookingRepo);
  const updateBookingStatusUseCase = new UpdateBookingStatusUseCase(bookingRepo);

  const getShopStatsUseCase = new GetShopStatsUseCase(bookingRepo, barberRepo);
  const getBarberStatsUseCase = new GetBarberStatsUseCase(bookingRepo);

  const webhookUseCase = new HandleStripeWebhookUseCase(bookingRepo, paymentService);

  // ── Instantiate Controllers ──
  const authController = new AuthController(sendOtpUseCase, verifyOtpUseCase, registerUseCase, loginUseCase);
  const barberController = new BarberController(syncBarberUseCase, getBarberProfileUseCase, updateBarberProfileUseCase);
  const shopController = new ShopController(createShopUseCase, getShopUseCase, addBarberUseCase, subscriptionCheckoutUseCase, billingPortalUseCase);
  const serviceController = new ServiceController(createServiceUseCase, getBarberServicesUseCase, updateServiceUseCase, deleteServiceUseCase);
  const bookingController = new BookingController(availabilityUseCase, createOnlineBookingUseCase, createManualBookingUseCase, getMyBookingsUseCase, updateBookingStatusUseCase);
  const paymentController = new PaymentController(webhookUseCase);
  const statisticsController = new StatisticsController(getShopStatsUseCase, getBarberStatsUseCase);

  // ── Mount Routes ──
  router.use('/auth', createAuthRoutes(authController));
  router.use('/barbers', createBarberRoutes(barberController));
  router.use('/shops', createShopRoutes(shopController));
  router.use('/services', createServiceRoutes(serviceController, subscriptionGuardBarber));
  router.use('/bookings', createBookingRoutes(bookingController, subscriptionGuardBarber, subscriptionGuardCustomer));
  router.use('/payments', createPaymentRoutes(paymentController));
  router.use('/statistics', createStatisticsRoutes(statisticsController));

  return router;
}
