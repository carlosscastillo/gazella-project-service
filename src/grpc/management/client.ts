import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "node:path";
import {
  ProjectManagementServiceClient,
  CreateProjectRequest,
  CreateProjectResponse,
  UpdateProjectRequest,
  UpdateProjectResponse,
  CancelProjectRequest,
  CancelProjectResponse,
} from "./types.js";

const PROTO_PATH = path.resolve(import.meta.dirname, "./project_management_service.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;
const managementPackage = protoDescriptor.management;

export class ProjectManagementGrpcClient {
  private readonly client: ProjectManagementServiceClient;

  constructor(dataServiceUrl: string) {
    this.client = new managementPackage.ProjectManagementService(
      dataServiceUrl,
      grpc.credentials.createInsecure()
    ) as ProjectManagementServiceClient;
  }

  public createProject(request: CreateProjectRequest): Promise<CreateProjectResponse> {
    return new Promise((resolve, reject) => {
      this.client.CreateProject(request, (error, response) => {
        error ? reject(error) : resolve(response);
      });
    });
  }

  public updateProject(request: UpdateProjectRequest): Promise<UpdateProjectResponse> {
    return new Promise((resolve, reject) => {
      this.client.UpdateProject(request, (error, response) => {
        error ? reject(error) : resolve(response);
      });
    });
  }

  public cancelProject(request: CancelProjectRequest): Promise<CancelProjectResponse> {
    return new Promise((resolve, reject) => {
      this.client.CancelProject(request, (error, response) => {
        error ? reject(error) : resolve(response);
      });
    });
  }
}