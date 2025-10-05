import { NextFunction, Request, Response } from "express";
import { createNamespace, getNamespace } from "cls-hooked";
import { HttpStatusCodes as StatusCodes } from "../utils/master-constants";
import { AppError } from "../utils/AppError";

export const errorHandler = (
  error: any,
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const responseInterceptor = getNamespace("responseInterceptor");

  if (!error) {
    return next(); // Move to the next middleware if no error
  }

  let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  let message = "An unexpected error occurred";
  let errorList = null;

  if (error instanceof AppError) {
    statusCode = error.statusCode();
    message = error.message;
    errorList = error.getErrorList();
  } else if (error.errorList && error.errorList.status) {
    statusCode = error.errorList.status;
    message = error.errorList.message;
    errorList = error.errorList.errorList || error.errorList.message || null;
  } else if (error.status) {
    statusCode = error.status;
    message = error.message;
    errorList = error.errorList || error.message || null;
  } else {
    message = error.message || message;
    errorList = error;
  }

  console.error(error as string);

  response.status(statusCode).send({
    error: {
      errorList: errorList,
      statusCode: statusCode,
      status: StatusCodes[StatusCodes.INTERNAL_SERVER_ERROR as any],
      reqMethod: responseInterceptor?.get("reqMethod"),
      timeStamp: responseInterceptor?.get("timeStamp"),
      pathUrl: responseInterceptor?.get("pathUrl"),
      apiVersion: `[${responseInterceptor?.get("apiVersion")}]`,
    },
  });
};
