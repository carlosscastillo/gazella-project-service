import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "node:path";
import {
  ProjectServiceClient,
  GetProjectsRequest,
  GetProjectsResponse,
  GetProjectRequest,
  GetProjectResponse,
  GetMyProjectsRequest,
  GetMyProjectsResponse,
  GetProjectVolunteersRequest,
  GetProjectVolunteersResponse,
} from "./types.js";

const PROTO_PATH = path.resolve(import.meta.dirname, "./project_service.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;
const projectPackage = protoDescriptor.project;

export class ProjectGrpcClient {
  private readonly client: ProjectServiceClient;

  constructor(dataServiceUrl: string) {
    this.client = new projectPackage.ProjectService(
      dataServiceUrl,
      grpc.credentials.createInsecure()
    ) as ProjectServiceClient;
  }

  public getProjects(request: GetProjectsRequest): Promise<GetProjectsResponse> {
    return new Promise((resolve, reject) => {
      this.client.GetProjects(request, (error, response) => {
        error ? reject(error) : resolve(response);
      });
    });
  }

  public getProject(request: GetProjectRequest): Promise<GetProjectResponse> {
    return new Promise((resolve, reject) => {
      this.client.GetProject(request, (error, response) => {
        error ? reject(error) : resolve(response);
      });
    });
  }

  public getMyProjects(request: GetMyProjectsRequest): Promise<GetMyProjectsResponse> {
    return new Promise((resolve, reject) => {
      this.client.GetMyProjects(request, (error, response) => {
        error ? reject(error) : resolve(response);
      });
    });
  }

  public getProjectVolunteers(request: GetProjectVolunteersRequest): Promise<GetProjectVolunteersResponse> {
    return new Promise((resolve, reject) => {
      this.client.GetProjectVolunteers(request, (error, response) => {
        error ? reject(error) : resolve(response);
      });
    });
  }
}