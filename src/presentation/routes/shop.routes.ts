import { Router } from 'express';
import { ShopController } from '@presentation/controllers/ShopController';
import { requireBarberAuth } from '@presentation/middlewares/clerkAuth';
import { validate } from '@presentation/middlewares/validate';
import {
  createShopSchema,
  addBarberSchema,
  subscribeSchema,
  getShopBySlugSchema,
} from '@presentation/validators/shop.validators';

export function createShopRoutes(controller: ShopController): Router {
  const router = Router();

  // Public: View a shop by slug (for customer booking page)
  router.get(
    '/:slug',
    validate(getShopBySlugSchema),
    controller.getBySlug,
  );

  // All routes below require Clerk authentication
  router.use(requireBarberAuth);

  // Shop management
  router.post('/', validate(createShopSchema), controller.create);
  router.get('/me', controller.getMyShop);

  // Barber management (Owner only)
  router.post('/me/barbers', validate(addBarberSchema), controller.addBarber);

  // Subscription management (Owner only)
  router.post('/me/subscribe', validate(subscribeSchema), controller.subscribe);
  router.post('/me/billing-portal', controller.billingPortal);

  return router;
}
