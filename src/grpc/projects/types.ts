import * as grpc from '@grpc/grpc-js';

export interface GetProjectsRequest {
  page_index: number;
  page_size: number;
  category_id: string;
  search_term: string;
}

export interface ProjectSummary {
  project_id: string;
  title: string;
  description: string;
  cover_uri: string;
  location: string;
  category: string;
  start_date: string;
  end_date: string;
  status: string;
  enrolled_count: number;
  max_volunteers: number;
}

export interface GetProjectsResponse {
  projects: ProjectSummary[];
  total_projects: number;
  current_page: number;
  page_count: number;
  page_size: number;
}

export interface GetProjectRequest {
  project_id: string;
}

export interface GetProjectResponse {
  project_id: string;
  title: string;
  description: string;
  cover_uri: string;
  location: string;
  category: string;
  start_date: string;
  end_date: string;
  status: string;
  enrolled_count: number;
  max_volunteers: number;
  organizer_id: string;
  organizer_name: string;
  organizer_pfp_uri: string;
  created_at: string;
}

export interface GetMyProjectsRequest {
  organizer_id: string;
}

export interface MyProject {
  project_id: string;
  title: string;
  location: string;
  start_date: string;
  end_date: string;
  status: string;
  enrolled_count: number;
  max_volunteers: number;
}

export interface GetMyProjectsResponse {
  projects: MyProject[];
}

export interface GetProjectVolunteersRequest {
  project_id: string;
  organizer_id: string;
  page_index: number;
  page_size: number;
}

export interface EnrolledVolunteer {
  volunteer_id: string;
  full_name: string;
  email: string;
  enrolled_at: string;
  enrollment_status: string;
}

export interface GetProjectVolunteersResponse {
  volunteers: EnrolledVolunteer[];
  total_volunteers: number;
  current_page: number;
  page_count: number;
  page_size: number;
}

export interface ProjectServiceClient extends grpc.Client {
  GetProjects(
    request: GetProjectsRequest,
    callback: (error: grpc.ServiceError | null, response: GetProjectsResponse) => void
  ): grpc.ClientUnaryCall;
  GetProject(
    request: GetProjectRequest,
    callback: (error: grpc.ServiceError | null, response: GetProjectResponse) => void
  ): grpc.ClientUnaryCall;
  GetMyProjects(
    request: GetMyProjectsRequest,
    callback: (error: grpc.ServiceError | null, response: GetMyProjectsResponse) => void
  ): grpc.ClientUnaryCall;
  GetProjectVolunteers(
    request: GetProjectVolunteersRequest,
    callback: (error: grpc.ServiceError | null, response: GetProjectVolunteersResponse) => void
  ): grpc.ClientUnaryCall;
}