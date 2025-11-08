import { ViolationPolicy } from '@/types/violation';

/**
 * Default number of days from today for violation payment due date
 */
export const DEFAULT_VIOLATION_DUE_DATE_DAYS = 3;

export const VIOLATION_POLICIES: Record<string, ViolationPolicy> = {
  LOST: {
    id: 'LOST_BOOK',
    name: 'Lost Book',
    points: 3,
    penaltyPercent: 100,
  },
  DAMAGED: {
    id: 'DAMAGED_BOOK',
    name: 'Severely Damaged Book',
    points: 2,
    penaltyPercent: 100,
  },
  WORN: {
    id: 'WORN_BOOK',
    name: 'Worn Book',
    points: 1,
    penaltyPercent: 50,
  },
};

/**
 * Get violation policy info by policy ID
 */
export function getViolationPolicyInfo(policyId: string): { name: string; points: number } {
  const policy = Object.values(VIOLATION_POLICIES).find(p => p.id === policyId);
  return policy ? { name: policy.name, points: policy.points } : { name: 'Unknown', points: 0 };
}

/**
 * Get violation policy by condition
 */
export function getViolationPolicyByCondition(condition: string): ViolationPolicy | null {
  return VIOLATION_POLICIES[condition] || null;
}

/**
 * Get violation policy by policy ID
 */
export function getViolationPolicyById(policyId: string): ViolationPolicy | null {
  return Object.values(VIOLATION_POLICIES).find(p => p.id === policyId) || null;
}

/**
 * Map policy ID to condition
 */
export function policyIdToCondition(policyId: string): string {
  const policyToCondition: Record<string, string> = {
    LOST_BOOK: 'LOST',
    DAMAGED_BOOK: 'DAMAGED',
    WORN_BOOK: 'WORN',
  };
  return policyToCondition[policyId] || '';
}

/**
 * Get policy options for form select
 */
export function getViolationPolicyOptions() {
  return Object.values(VIOLATION_POLICIES).map(policy => ({
    value: policy.id,
    label: `${policy.name} (+${policy.points} points, ${policy.penaltyPercent}% of book value)`,
  }));
}
