import { Router } from "express";
import { requireAuth } from "./validators/auth_validator.js";
import { asyncHandler } from "./handlers/async_handler.js";
import { validateBody, validateParams, validateQuery } from "./validators/request_validator.js";
import { executeGrpcCall } from "./grpc/grpc_util.js";

import { ProjectGrpcClient } from "./grpc/projects/client.js";
import { ProjectManagementGrpcClient } from "./grpc/management/client.js";
import { RegistrationGrpcClient } from "./grpc/registrations/client.js";

import { ProjectIdSchema, GetProjectsQuerySchema, GetProjectVolunteersQuerySchema } from "./schemas/project_schema.js";
import { CreateProjectSchema, UpdateProjectSchema } from "./schemas/management_schema.js";
import { RegistrationParamsSchema } from "./schemas/registration_schema.js";

import { makeGetProjectsController, makeGetProjectController, makeGetMyProjectsController, makeGetProjectVolunteersController } from "./controllers/project_controller.js";
import { makeCreateProjectController, makeUpdateProjectController, makeCancelProjectController } from "./controllers/management_controller.js";
import { makeSignUpController, makeCancelRegistrationController, makeGetMyEnrollmentsController } from "./controllers/registration_controller.js";

const router = Router();

const dataServiceUrl = process.env["DATA_SERVICE_URL"] || "localhost:8200";

const projectClient = new ProjectGrpcClient(dataServiceUrl);
const managementClient = new ProjectManagementGrpcClient(dataServiceUrl);
const registrationClient = new RegistrationGrpcClient(dataServiceUrl);

const getProjects = makeGetProjectsController(projectClient, executeGrpcCall);
const getProject = makeGetProjectController(projectClient, executeGrpcCall);
const getMyProjects = makeGetMyProjectsController(projectClient, executeGrpcCall);
const getProjectVolunteers = makeGetProjectVolunteersController(projectClient, executeGrpcCall);

const createProject = makeCreateProjectController(managementClient, executeGrpcCall);
const updateProject = makeUpdateProjectController(managementClient, executeGrpcCall);
const cancelProject = makeCancelProjectController(managementClient, executeGrpcCall);

const signUp = makeSignUpController(registrationClient, executeGrpcCall);
const cancelRegistration = makeCancelRegistrationController(registrationClient, executeGrpcCall);
const getMyEnrollments = makeGetMyEnrollmentsController(registrationClient, executeGrpcCall);

router.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok", service: "project-service" });
});

router.get("/projects", validateQuery(GetProjectsQuerySchema), asyncHandler(getProjects));
router.get("/projects/:projectId", validateParams(ProjectIdSchema), asyncHandler(getProject));
router.get("/my-projects", requireAuth, asyncHandler(getMyProjects));
router.get("/projects/:projectId/volunteers", requireAuth, validateParams(ProjectIdSchema), validateQuery(GetProjectVolunteersQuerySchema), asyncHandler(getProjectVolunteers));

router.post("/projects", requireAuth, validateBody(CreateProjectSchema), asyncHandler(createProject));
router.patch("/projects/:projectId", requireAuth, validateParams(ProjectIdSchema), validateBody(UpdateProjectSchema), asyncHandler(updateProject));
router.post("/projects/:projectId/cancellations", requireAuth, validateParams(ProjectIdSchema), asyncHandler(cancelProject));

router.post("/projects/:projectId/registrations", requireAuth, validateParams(RegistrationParamsSchema), asyncHandler(signUp));
router.delete("/projects/:projectId/registrations", requireAuth, validateParams(RegistrationParamsSchema), asyncHandler(cancelRegistration));
router.get("/my-enrollments", requireAuth, asyncHandler(getMyEnrollments));

export default router;