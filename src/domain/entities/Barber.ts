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
 * Barber / Salon Owner entity.
 * Authenticated via Clerk (B2B flow).
 */
export interface IBarber {
  clerkId: string;
  name: string;
  email: string;
  slug: string;
  phone?: string;
  shopName?: string;
  address?: string;
  bio?: string;
  businessHours: IBusinessHours[];
  createdAt: Date;
  updatedAt: Date;
}
