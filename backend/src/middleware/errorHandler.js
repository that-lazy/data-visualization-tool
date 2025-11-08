function notFoundHandler(req, res, next) {
  res.status(404).json({ message: 'Resource not found' });
}

function errorHandler(err, req, res, next) {
  // eslint-disable-next-line no-console
  if (process.env.NODE_ENV !== 'test') console.error(err);

  const status = err.status || 500;
  const message = err.message || 'Internal server error';

  res.status(status).json({ message });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
