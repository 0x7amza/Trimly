import { Router } from 'express';
import { BarberController } from '@presentation/controllers/BarberController';
import { requireBarberAuth } from '@presentation/middlewares/clerkAuth';
import { validate } from '@presentation/middlewares/validate';
import {
  syncBarberSchema,
  updateBarberSchema,
} from '@presentation/validators/barber.validators';

export function createBarberRoutes(controller: BarberController): Router {
  const router = Router();

  // All barber routes require Clerk authentication
  router.use(requireBarberAuth);

  router.post('/sync', validate(syncBarberSchema), controller.sync);
  router.get('/me', controller.getProfile);
  router.put('/me', validate(updateBarberSchema), controller.updateProfile);

  return router;
}
