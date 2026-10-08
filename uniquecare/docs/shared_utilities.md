# Shared Utilities (Backend)

- **`AppError`**: Custom error class extending `Error` to attach HTTP status codes.
- **`errorHandler` middleware**: Express middleware to catch errors, format them consistently (e.g., `{ status: 'error', message: '...' }`), and prevent stack trace leaks in production.
- **`catchAsync` wrapper**: Utility to wrap async controllers to pass promise rejections directly to the `next()` middleware.
- **VAPID Keys**: Ensure a consistent module for VAPID Web Push setup and broadcasting.
