class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
  }
}

const createError = (statusCode, message) => new HttpError(statusCode, message);

module.exports = {
  HttpError,
  createError,
};

