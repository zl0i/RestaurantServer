
export class HttpError extends Error { code: number }

export class BadRequestError extends HttpError { code = 400 } //400
export class UnauthorizedError extends HttpError { code = 401 } //401
export class ForbiddenError extends HttpError { code = 403 } //403
export class NotFoundError extends HttpError { code = 404 } //404
export class InternalError extends HttpError { code = 500 } //500
export class NotImplementedError extends HttpError { code = 501 } //501
export class UnknownError extends HttpError { code = 520 } //520
