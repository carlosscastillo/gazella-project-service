import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "node:path";
import {
  RegistrationServiceClient,
  SignUpRequest,
  SignUpResponse,
  CancelRegistrationRequest,
  CancelRegistrationResponse,
  GetMyEnrollmentsRequest,
  GetMyEnrollmentsResponse,
} from "./types.js";

const PROTO_PATH = path.resolve(import.meta.dirname, "./registration_service.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;
const registrationPackage = protoDescriptor.registration;

export class RegistrationGrpcClient {
  private readonly client: RegistrationServiceClient;

  constructor(dataServiceUrl: string) {
    this.client = new registrationPackage.RegistrationService(
      dataServiceUrl,
      grpc.credentials.createInsecure()
    ) as RegistrationServiceClient;
  }

  public signUp(request: SignUpRequest): Promise<SignUpResponse> {
    return new Promise((resolve, reject) => {
      this.client.SignUp(request, (error, response) => {
        error ? reject(error) : resolve(response);
      });
    });
  }

  public cancelRegistration(request: CancelRegistrationRequest): Promise<CancelRegistrationResponse> {
    return new Promise((resolve, reject) => {
      this.client.CancelRegistration(request, (error, response) => {
        error ? reject(error) : resolve(response);
      });
    });
  }

  public getMyEnrollments(request: GetMyEnrollmentsRequest): Promise<GetMyEnrollmentsResponse> {
    return new Promise((resolve, reject) => {
      this.client.GetMyEnrollments(request, (error, response) => {
        error ? reject(error) : resolve(response);
      });
    });
  }
}