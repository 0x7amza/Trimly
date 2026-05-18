import { Request, Response } from 'express';
import { asyncHandler } from '@shared/utils/asyncHandler';
import { CreateShopUseCase } from '@application/use-cases/shop/CreateShopUseCase';
import { GetShopUseCase } from '@application/use-cases/shop/GetShopUseCase';
import { AddBarberToShopUseCase } from '@application/use-cases/shop/AddBarberToShopUseCase';
import { CreateSubscriptionCheckoutUseCase } from '@application/use-cases/subscription/CreateSubscriptionCheckoutUseCase';
import { CreateBillingPortalUseCase } from '@application/use-cases/subscription/CreateBillingPortalUseCase';

export class ShopController {
  constructor(
    private createShopUseCase: CreateShopUseCase,
    private getShopUseCase: GetShopUseCase,
    private addBarberUseCase: AddBarberToShopUseCase,
    private subscriptionCheckoutUseCase: CreateSubscriptionCheckoutUseCase,
    private billingPortalUseCase: CreateBillingPortalUseCase,
  ) {}

  create = asyncHandler(async (req: Request, res: Response) => {
    const shop = await this.createShopUseCase.execute({
      ownerId: req.barberClerkId!,
      name: req.body.name,
    });
    res.status(201).json({ success: true, data: shop });
  });

  getMyShop = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.getShopUseCase.executeByOwnerId(req.barberClerkId!);
    res.status(200).json({ success: true, data: result });
  });

  getBySlug = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.getShopUseCase.executeBySlug(req.params.slug as string);
    res.status(200).json({ success: true, data: result });
  });

  addBarber = asyncHandler(async (req: Request, res: Response) => {
    const barber = await this.addBarberUseCase.execute({
      ownerClerkId: req.barberClerkId!,
      barberPassword: req.body.barberPassword,
      barberName: req.body.barberName,
      barberEmail: req.body.barberEmail,
    });
    res.status(201).json({ success: true, data: barber });
  });

  subscribe = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.subscriptionCheckoutUseCase.execute({
      ownerClerkId: req.barberClerkId!,
      plan: req.body.plan,
    });
    res.status(200).json({ success: true, data: result });
  });

  billingPortal = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.billingPortalUseCase.execute(req.barberClerkId!);
    res.status(200).json({ success: true, data: result });
  });
}
