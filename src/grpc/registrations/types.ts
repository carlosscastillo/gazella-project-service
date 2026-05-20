import * as grpc from '@grpc/grpc-js';

export interface SignUpRequest {
  project_id: string;
  volunteer_id: string;
}

export interface SignUpResponse {
  enrollment_id: string;
  message: string;
}

export interface CancelRegistrationRequest {
  project_id: string;
  volunteer_id: string;
}

export interface CancelRegistrationResponse {
  enrollment_status: string;
  message: string;
}

export interface GetMyEnrollmentsRequest {
  volunteer_id: string;
}

export interface MyEnrollment {
  project_id: string;
  project_title: string;
  location: string;
  start_date: string;
  project_status: string;
  enrollment_status: string;
  enrolled_at: string;
}

export interface GetMyEnrollmentsResponse {
  enrollments: MyEnrollment[];
}

export interface RegistrationServiceClient extends grpc.Client {
  SignUp(
    request: SignUpRequest,
    callback: (error: grpc.ServiceError | null, response: SignUpResponse) => void
  ): grpc.ClientUnaryCall;
  CancelRegistration(
    request: CancelRegistrationRequest,
    callback: (error: grpc.ServiceError | null, response: CancelRegistrationResponse) => void
  ): grpc.ClientUnaryCall;
  GetMyEnrollments(
    request: GetMyEnrollmentsRequest,
    callback: (error: grpc.ServiceError | null, response: GetMyEnrollmentsResponse) => void
  ): grpc.ClientUnaryCall;
}