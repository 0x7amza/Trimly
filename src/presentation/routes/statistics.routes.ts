import { Router } from 'express';
import { StatisticsController } from '@presentation/controllers/StatisticsController';
import { requireBarberAuth, requireOwner } from '@presentation/middlewares/clerkAuth';

export function createStatisticsRoutes(controller: StatisticsController): Router {
  const router = Router();

  router.use(requireBarberAuth);

  // Shop Owner only
  router.get('/shop', requireOwner, controller.getShopStats);

  // Barbers can view their own, Owner can view any
  router.get('/barber/:barberId?', controller.getBarberStats);

  return router;
}
