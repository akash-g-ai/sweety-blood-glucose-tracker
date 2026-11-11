// Express identifies error-handling middleware by the four-parameter signature.
// The `next` parameter must be declared even if unused.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const status = err.status ?? err.statusCode ?? 500;
  const message = err.message ?? "Internal Server Error";
  res.status(status).json({ error: message });
}
