export const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  let message = err.message || 'Server error';
  const details = {};

  if (err.name === 'CastError') {
    statusCode = 404;
    message = 'Resource not found';
  }

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    details.fields = Object.values(err.errors).map((item) => item.message);
  }

  if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate value already exists';
    details.keys = Object.keys(err.keyValue || {});
  }

  res.status(statusCode).json({
    message,
    details,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
};
