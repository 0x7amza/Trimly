/**
 * Service entity — a specific service offered by a barber.
 * Price is stored in the smallest currency unit (pence for GBP).
 */
export interface IService {
  id: string;
  barberId: string;       // clerkId of the barber
  name: string;           // e.g. "Skin Fade"
  price: number;          // In pence (e.g. 1500 = £15.00)
  durationMinutes: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
