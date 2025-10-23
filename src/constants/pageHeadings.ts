import { ROUTES } from './routes';

export const pageHeadings: Record<string, string> = {
  // Common routes
  [ROUTES.PROFILE]: 'My Profile',
  [ROUTES.SETTINGS]: 'Settings',

  // Dashboard routes
  [ROUTES.DASHBOARD.HOME]: 'Dashboard',

  // Books routes
  [ROUTES.DASHBOARD.BOOKS]: 'Books Management',
  [ROUTES.DASHBOARD.BOOKS_ADD]: 'Add New Book',
  [ROUTES.DASHBOARD.BOOKS_EDIT]: 'Edit Book',
  [ROUTES.DASHBOARD.BOOKS_COPIES]: 'Book Copies Management',
  [ROUTES.DASHBOARD.BOOKS_COPIES_ADD]: 'Add New Book Copy',
  [ROUTES.DASHBOARD.BOOKS_EDITIONS]: 'Book Editions Management',
  [ROUTES.DASHBOARD.BOOKS_EDITIONS_ADD]: 'Add New Book Edition',

  // Authors routes
  [ROUTES.DASHBOARD.AUTHORS]: 'Authors Management',
  [ROUTES.DASHBOARD.AUTHORS_ADD]: 'Add New Author',
  [ROUTES.DASHBOARD.AUTHORS_EDIT]: 'Edit Author',

  // Categories routes
  [ROUTES.DASHBOARD.CATEGORIES]: 'Categories Management',
  [ROUTES.DASHBOARD.CATEGORIES_ADD]: 'Add New Category',
  [ROUTES.DASHBOARD.CATEGORIES_EDIT]: 'Edit Category',

  // Borrowers routes
  [ROUTES.DASHBOARD.USERS]: 'Users Management',
  [ROUTES.DASHBOARD.REPORTS]: 'Reports',
  [ROUTES.DASHBOARD.BORROWERS]: 'Borrowers Management',
};
