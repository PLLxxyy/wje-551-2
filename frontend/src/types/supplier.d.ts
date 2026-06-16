import type { SupplierStatus } from '../constants/enums';

export interface RatingRecord {
  id: string;
  score: number;
  weight: number;
  remark: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
  status: SupplierStatus;
  rating: number;
  ratingHistory: RatingRecord[];
  onTimeRate: number;
  onTimeCount: number;
  totalDelivered: number;
  createdAt: string;
  updatedAt: string;
}
