// Route constants for the application
export const ROUTES = {
  // Auth routes
  LOGIN: '/login',

  // Admin routes
  ADMIN: {
    DASHBOARD: '/admin',
    USERS: '/admin/users',
    REPORTS: '/admin/reports',
  },

  // Librarian routes
  LIBRARIAN: {
    DASHBOARD: '/librarian',
    BOOKS: '/librarian/books',
    BOOKS_ADD: '/librarian/books/add',
    BOOKS_EDIT: '/librarian/books/edit',
    BOOKS_COPIES: '/librarian/books/copies',
    BOOKS_COPIES_ADD: '/librarian/books/copies/add',
    BOOKS_EDITIONS: '/librarian/books/editions',
    BOOKS_EDITIONS_ADD: '/librarian/books/editions/add',
    BORROWERS: '/librarian/borrowers',
  },

  // Common routes
  PROFILE: '/profile',
  SETTINGS: '/settings',
  LOGOUT: '/logout',
} as const;

// Type for route values
export type RouteValue =
  | (typeof ROUTES)[keyof typeof ROUTES]
  | (typeof ROUTES.ADMIN)[keyof typeof ROUTES.ADMIN]
  | (typeof ROUTES.LIBRARIAN)[keyof typeof ROUTES.LIBRARIAN];
