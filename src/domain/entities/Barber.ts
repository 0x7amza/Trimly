/**
 * Business Hours for a single day of the week.
 */
export interface IBusinessHours {
  day: number;        // 0 = Sunday, 6 = Saturday
  open: string;       // "09:00" (24-hour format)
  close: string;      // "17:00"
  isClosed: boolean;  // true = shop is closed that day
}

/**
 * Barber role within a shop.
 */
export type BarberRole = 'OWNER' | 'BARBER';

/**
 * Barber / Salon Staff entity.
 * Authenticated via Clerk (B2B flow).
 * Belongs to a Shop (multi-barber accounts).
 */
export interface IBarber {
  clerkId: string;
  shopId?: string;
  role: BarberRole;
  name: string;
  email: string;
  slug: string;
  phone?: string;
  shopName?: string;
  address?: string;
  bio?: string;
  timezone: string;
  businessHours: IBusinessHours[];
  createdAt: Date;
  updatedAt: Date;
}
