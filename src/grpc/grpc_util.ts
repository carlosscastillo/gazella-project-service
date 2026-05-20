import * as grpc from '@grpc/grpc-js';
import { ServiceDomainError } from '../errors/error.js';

const INVALID_ARGUMENT = "invalid_argument";
const DB_UNAVAILABLE = "db_unavailable";
const INVALID_OPERATION = "invalid_operation";
const NOT_FOUND = "not_found";
const ABORTED = "aborted";

export async function executeGrpcCall<T>(grpcPromise: Promise<T>): Promise<T> {
  try {
    return await grpcPromise;
  } catch (err: any) {
    const error = err as grpc.ServiceError;

    const domainCodeMeta = error.metadata?.get("x-gazella-error");
    const isDomainError = domainCodeMeta && domainCodeMeta.length > 0;

    if (isDomainError) {
      const domainCode = domainCodeMeta[0] as string;

      const code = getErrorCode(domainCode);
      const statusCode = getStatusCode(domainCode);

      throw new ServiceDomainError(domainCode, error.details, code, statusCode);
    }

    console.error(`[PROTOCOL FAULT] gRPC Code: ${error.code} | Details: ${error.details}`);

    const message = error.code === grpc.status.INTERNAL ?
      "Project data service failed to respond due to an internal error" :
      "An internal infrastructure error occurred while communicating with Project Data Service";
    
    throw new Error(message);
  }
}

function getErrorCode(domainCode: string): string {
  switch (domainCode) {
    case INVALID_ARGUMENT:   return "INVALID_ARGUMENT";
    case INVALID_OPERATION:  return "INVALID_OPERATION";
    case DB_UNAVAILABLE:     return "DB_UNAVAILABLE";
    case NOT_FOUND:          return "NOT_FOUND";
    case ABORTED:            return "ABORTED";
    default:                 return domainCode;
  }
}

function getStatusCode(domainCode: string): number {
  switch (domainCode) {
    case INVALID_ARGUMENT:   return 400;
    case INVALID_OPERATION:  return 422;
    case DB_UNAVAILABLE:     return 503;
    case NOT_FOUND:          return 404;
    case ABORTED:            return 409;
    default:                 return 500;
  }
}

export type ExecuteCall = (<T>(promise: Promise<T>) => Promise<T>);
