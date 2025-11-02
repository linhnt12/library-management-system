import { ROUTES } from './routes';

export const pageHeadings: Record<string, string> = {
  // Common routes
  [ROUTES.PROFILE]: 'My Profile',
  [ROUTES.SETTINGS]: 'Settings',

  // Dashboard routes
  [ROUTES.DASHBOARD.HOME]: 'Dashboard',

  // Profile routes
  [ROUTES.DASHBOARD.PROFILE]: 'My Profile',

  // Books routes
  [ROUTES.DASHBOARD.BOOKS]: 'Books Management',
  [ROUTES.DASHBOARD.BOOKS_ADD]: 'Add New Book',
  [ROUTES.DASHBOARD.BOOKS_EDIT]: 'Edit Book',

  // Book Copies routes
  [ROUTES.DASHBOARD.BOOKS_COPIES]: 'Book Copies Management',
  [ROUTES.DASHBOARD.BOOKS_COPIES_ADD]: 'Add New Book Copy',
  [ROUTES.DASHBOARD.BOOKS_COPIES_EDIT]: 'Edit Book Copy',

  // Book Editions routes
  [ROUTES.DASHBOARD.BOOKS_EDITIONS]: 'Book Editions Management',
  [ROUTES.DASHBOARD.BOOKS_EDITIONS_ADD]: 'Add New Book Edition',
  [ROUTES.DASHBOARD.BOOKS_EDITIONS_EDIT]: 'Edit Book Edition',

  // Borrowing routes
  [ROUTES.DASHBOARD.BORROW_REQUESTS]: 'Borrow Requests Management',
  [ROUTES.DASHBOARD.BORROW_RECORDS]: 'Borrow Records Management',
  [ROUTES.DASHBOARD.BORROW_RECORDS_ADD]: 'Add New Borrow Record',

  // Authors routes
  [ROUTES.DASHBOARD.AUTHORS]: 'Authors Management',
  [ROUTES.DASHBOARD.AUTHORS_ADD]: 'Add New Author',
  [ROUTES.DASHBOARD.AUTHORS_EDIT]: 'Edit Author',

  // Categories routes
  [ROUTES.DASHBOARD.CATEGORIES]: 'Categories Management',
  [ROUTES.DASHBOARD.CATEGORIES_ADD]: 'Add New Category',
  [ROUTES.DASHBOARD.CATEGORIES_EDIT]: 'Edit Category',

  // Users routes
  [ROUTES.DASHBOARD.USERS]: 'Users Management',
  [ROUTES.DASHBOARD.USERS_ADD]: 'Add New User',
  [ROUTES.DASHBOARD.USERS_EDIT]: 'Edit User',
};
