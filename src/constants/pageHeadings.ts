import { ROUTES } from './routes';

export const pageHeadings: Record<string, string> = {
  // Common routes
  [ROUTES.PROFILE]: 'My Profile',
  [ROUTES.SETTINGS]: 'Settings',

  // Dashboard routes
  [ROUTES.DASHBOARD.HOME]: 'Dashboard',
  [ROUTES.DASHBOARD.BOOKS]: 'Books Management',
  [ROUTES.DASHBOARD.BOOKS_ADD]: 'Add New Book',
  [ROUTES.DASHBOARD.BOOKS_EDIT]: 'Edit Book',
  [ROUTES.DASHBOARD.USERS]: 'Manage Users',
  [ROUTES.DASHBOARD.REPORTS]: 'Reports',
  [ROUTES.DASHBOARD.BORROWERS]: 'Borrowers',
};
