// Violation Types
export interface Violation {
  bookItemId: number;
  policyId: string;
  amount: number;
  dueDate: string;
}

// Violation with additional details
export interface ViolationWithDetails extends Violation {
  id?: number;
  paymentId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Violation Policy Types
export type ViolationType = 'LOST_BOOK' | 'DAMAGED_BOOK' | 'WORN_BOOK';

export interface ViolationPolicy {
  id: ViolationType;
  name: string;
  points: number;
  penaltyPercent: number;
}
