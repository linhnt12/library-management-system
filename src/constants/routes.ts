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
    BOOKS_COPIES: '/librarian/books/copies',
    EBOOKS: '/librarian/ebooks',
    EBOOKS_ADD: '/librarian/ebooks/add',
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
