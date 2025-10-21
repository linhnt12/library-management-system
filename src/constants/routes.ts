// Route constants for the application
export const ROUTES = {
  // Auth routes
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
  },

  // Dashboard routes
  DASHBOARD: {
    // Common routes
    HOME: '/dashboard',
    PROFILE: '/dashboard/profile',
    BOOKS: '/dashboard/books',
    BOOKS_ADD: '/dashboard/books/add',
    BOOKS_EDIT: '/dashboard/books/edit',
    BOOKS_COPIES: '/dashboard/books/copies',
    BOOKS_COPIES_ADD: '/dashboard/books/copies/add',
    BOOKS_EDITIONS: '/dashboard/books/editions',
    BOOKS_EDITIONS_ADD: '/dashboard/books/editions/add',
    BORROWERS: '/dashboard/borrowers',

    // TODO: This will be updated later
    // Admin routes
    USERS: '/dashboard/users',
    REPORTS: '/dashboard/reports',
  },

  // Common routes
  HOME: '/',
  SEARCH: '/search',
  BOOK_DETAIL: '/books/:id',
  MY_SHELF: '/my-shelf',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  LOGOUT: '/logout',
} as const;

// Type for route values
export type RouteValue =
  | (typeof ROUTES)[keyof typeof ROUTES]
  | (typeof ROUTES.DASHBOARD)[keyof typeof ROUTES.DASHBOARD];
