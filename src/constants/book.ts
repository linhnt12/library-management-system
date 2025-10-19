import { getConditionOptions, getStatusOptions } from '@/lib/utils/enum-utils';
import { Condition, ItemStatus } from '@prisma/client';

// Mock data for categories
export const CATEGORY_OPTIONS = [
  { value: 1, label: 'Fiction' },
  { value: 2, label: 'Non-Fiction' },
  { value: 3, label: 'Science Fiction' },
  { value: 4, label: 'Mystery' },
  { value: 5, label: 'Romance' },
  { value: 6, label: 'Thriller' },
  { value: 7, label: 'Biography' },
  { value: 8, label: 'History' },
  { value: 9, label: 'Science' },
  { value: 10, label: 'Technology' },
];

// Mock data for publishers
export const PUBLISHER_OPTIONS = [
  { value: '1', label: 'Penguin Random House' },
  { value: '2', label: 'HarperCollins' },
  { value: '3', label: 'Simon & Schuster' },
  { value: '4', label: 'Macmillan Publishers' },
  { value: '5', label: 'Hachette Book Group' },
  { value: '6', label: 'Scholastic' },
  { value: '7', label: 'Oxford University Press' },
  { value: '8', label: 'Cambridge University Press' },
  { value: '9', label: 'Wiley' },
  { value: '10', label: 'Pearson' },
];

// Custom labels for condition
export const CONDITION_LABELS: Partial<Record<Condition, string>> = {
  NEW: 'New',
  GOOD: 'Good',
  WORN: 'Worn',
  DAMAGED: 'Damaged',
  LOST: 'Lost',
};

// Custom labels for status
export const STATUS_LABELS: Partial<Record<ItemStatus, string>> = {
  AVAILABLE: 'Available',
  ON_BORROW: 'On Borrow',
  RESERVED: 'Reserved',
  MAINTENANCE: 'Maintenance',
  RETIRED: 'Retired',
  LOST: 'Lost',
};

// Book item options
export const BOOK_ITEM_CONDITION_OPTIONS = getConditionOptions(CONDITION_LABELS);
export const BOOK_ITEM_STATUS_OPTIONS = getStatusOptions(STATUS_LABELS);

// Mock data for book status
export const BOOK_STATUS_OPTIONS = [
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'OUT_OF_STOCK', label: 'Out of Stock' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
  { value: 'LOST', label: 'Lost' },
  { value: 'DAMAGED', label: 'Damaged' },
];
