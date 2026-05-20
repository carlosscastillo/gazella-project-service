import * as grpc from '@grpc/grpc-js';

export interface CreateProjectRequest {
  title: string;
  description: string;
  cover_uri: string;
  location: string;
  category_id: string;
  organizer_id: string;
  organizer_name: string;
  organizer_pfp_uri: string;
  start_date: string;
  end_date: string;
  max_volunteers: number;
}

export interface CreateProjectResponse {
  project_id: string;
  message: string;
}

export interface UpdateProjectRequest {
  project_id: string;
  organizer_id: string;
  title: string;
  description: string;
  cover_uri: string;
  location: string;
  category_id: string;
  start_date: string;
  end_date: string;
  max_volunteers: number;
}

export interface UpdateProjectResponse {
  is_success: boolean;
  message: string;
}

export interface CancelProjectRequest {
  project_id: string;
  organizer_id: string;
}

export interface CancelProjectResponse {
  project_status: string;
  message: string;
}

export interface ProjectManagementServiceClient extends grpc.Client {
  CreateProject(
    request: CreateProjectRequest,
    callback: (error: grpc.ServiceError | null, response: CreateProjectResponse) => void
  ): grpc.ClientUnaryCall;
  UpdateProject(
    request: UpdateProjectRequest,
    callback: (error: grpc.ServiceError | null, response: UpdateProjectResponse) => void
  ): grpc.ClientUnaryCall;
  CancelProject(
    request: CancelProjectRequest,
    callback: (error: grpc.ServiceError | null, response: CancelProjectResponse) => void
  ): grpc.ClientUnaryCall;
}