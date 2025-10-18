import { ROUTES } from './routes';

export const pageHeadings: Record<string, string> = {
  // Common routes
  [ROUTES.PROFILE]: 'My Profile',
  [ROUTES.SETTINGS]: 'Settings',

  // Admin routes
  [ROUTES.ADMIN.DASHBOARD]: 'Dashboard',
  [ROUTES.ADMIN.USERS]: 'Manage Users',

  // Librarian routes
  [ROUTES.LIBRARIAN.DASHBOARD]: 'Dashboard',
  [ROUTES.LIBRARIAN.BOOKS]: 'Books Management',
  [ROUTES.LIBRARIAN.BOOKS_ADD]: 'Add New Book',
  [ROUTES.LIBRARIAN.BOOKS_EDIT]: 'Edit Book',
};
