/**
 * Customer entity.
 * Authenticated via custom JWT (B2C flow).
 */
export interface ICustomer {
  id: string;
  phone: string;
  email?: string;
  name?: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}
