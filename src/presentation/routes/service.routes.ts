import { Router, RequestHandler } from 'express';
import { ServiceController } from '@presentation/controllers/ServiceController';
import { requireBarberAuth } from '@presentation/middlewares/clerkAuth';
import { validate } from '@presentation/middlewares/validate';
import {
  createServiceSchema,
  updateServiceSchema,
  getBarberServicesSchema,
  deleteServiceSchema,
} from '@presentation/validators/service.validators';

export function createServiceRoutes(
  controller: ServiceController,
  subscriptionGuard: RequestHandler,
): Router {
  const router = Router();

  // Public: Customers can browse a barber's services
  router.get(
    '/barber/:clerkId',
    validate(getBarberServicesSchema),
    controller.getByBarber,
  );

  // Protected: CUD operations require Clerk auth + active subscription
  router.post(
    '/',
    requireBarberAuth,
    subscriptionGuard,
    validate(createServiceSchema),
    controller.create,
  );

  router.put(
    '/:id',
    requireBarberAuth,
    subscriptionGuard,
    validate(updateServiceSchema),
    controller.update,
  );

  router.delete(
    '/:id',
    requireBarberAuth,
    subscriptionGuard,
    validate(deleteServiceSchema),
    controller.delete,
  );

  return router;
}
