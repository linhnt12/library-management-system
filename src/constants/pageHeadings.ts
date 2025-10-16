import { ROUTES } from './routes';

export const commonHeadings: Record<string, string> = {
  [ROUTES.PROFILE]: 'My Profile',
  [ROUTES.SETTINGS]: 'Settings',
};

export const adminHeadings: Record<string, string> = {
  [ROUTES.ADMIN.DASHBOARD]: 'Dashboard',
  [ROUTES.ADMIN.USERS]: 'Manage Users',
};

export const librarianHeadings: Record<string, string> = {
  [ROUTES.LIBRARIAN.DASHBOARD]: 'Dashboard',
  [ROUTES.LIBRARIAN.BOOKS]: 'Books Management',
  [ROUTES.LIBRARIAN.BOOKS_ADD]: 'Add New Book',
};
