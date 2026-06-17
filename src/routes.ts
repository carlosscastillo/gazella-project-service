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

const signUp = makeSignUpController(registrationClient, projectClient, executeGrpcCall);
const cancelRegistration = makeCancelRegistrationController(registrationClient, projectClient, executeGrpcCall);
const getMyEnrollments = makeGetMyEnrollmentsController(registrationClient, executeGrpcCall);

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Health check
 *     tags: [Health]
 *     responses:
 *       '200':
 *         description: Service is up and running.
 */
router.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok", service: "project-service" });
});

/**
 * @openapi
 * /projects:
 *   get:
 *     summary: List active projects
 *     tags: [Projects]
 *     parameters:
 *       - in: query
 *         name: pageIndex
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: categoryId
 *         schema: { type: string }
 *       - in: query
 *         name: searchTerm
 *         schema: { type: string }
 *       - in: query
 *         name: location
 *         schema: { type: string }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, example: "2026-06-15" }
 *       - in: query
 *         name: orderBy
 *         schema: { type: string, enum: [newest, soonest], default: newest }
 *     responses:
 *       '200':
 *         description: Paginated list of active projects.
 *       '400':
 *         description: Invalid query parameters.
 */
router.get("/projects", validateQuery(GetProjectsQuerySchema), asyncHandler(getProjects));

/**
 * @openapi
 * /projects/{projectId}:
 *   get:
 *     summary: Get project detail
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       '200':
 *         description: Project detail.
 *       '404':
 *         description: Project not found.
 */
router.get("/projects/:projectId", validateParams(ProjectIdSchema), asyncHandler(getProject));

/**
 * @openapi
 * /my-projects:
 *   get:
 *     summary: Get organizer's own projects
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: List of organizer's projects.
 *       '401':
 *         description: Unauthorized.
 *       '403':
 *         description: Forbidden — user is not an organizer.
 */
router.get("/my-projects", requireAuth, asyncHandler(getMyProjects));

/**
 * @openapi
 * /projects/{projectId}/volunteers:
 *   get:
 *     summary: Get volunteers enrolled in a project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: pageIndex
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: searchTerm
 *         schema: { type: string }
 *       - in: query
 *         name: statusFilter
 *         schema: { type: string, enum: [all, confirmed, cancelled], default: all }
 *     responses:
 *       '200':
 *         description: Paginated list of enrolled volunteers.
 *       '401':
 *         description: Unauthorized.
 *       '403':
 *         description: Forbidden — user is not the organizer of this project.
 */
router.get("/projects/:projectId/volunteers", requireAuth, validateParams(ProjectIdSchema), validateQuery(GetProjectVolunteersQuerySchema), asyncHandler(getProjectVolunteers));

/**
 * @openapi
 * /projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, location, categoryId, organizerId, organizerName, startDate, endDate, maxVolunteers]
 *             properties:
 *               title: { type: string, maxLength: 128 }
 *               description: { type: string, maxLength: 2000 }
 *               location: { type: string, maxLength: 256 }
 *               categoryId: { type: string, format: uuid }
 *               organizerId: { type: string, format: uuid }
 *               organizerName: { type: string }
 *               coverUri: { type: string, format: uri }
 *               organizerPfpUri: { type: string, format: uri }
 *               startDate: { type: string, example: "2026-06-15" }
 *               endDate: { type: string, example: "2026-06-16" }
 *               maxVolunteers: { type: integer, minimum: 1, maximum: 10000 }
 *               isDraft: { type: boolean, default: false }
 *     responses:
 *       '201':
 *         description: Project created successfully.
 *       '400':
 *         description: Invalid input.
 *       '401':
 *         description: Unauthorized.
 *       '403':
 *         description: Forbidden.
 *       '404':
 *         description: Category not found.
 */
router.post("/projects", requireAuth, validateBody(CreateProjectSchema), asyncHandler(createProject));

/**
 * @openapi
 * /projects/{projectId}:
 *   patch:
 *     summary: Update an existing project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, location, categoryId, startDate, endDate, maxVolunteers]
 *             properties:
 *               title: { type: string, maxLength: 128 }
 *               description: { type: string, maxLength: 2000 }
 *               location: { type: string, maxLength: 256 }
 *               categoryId: { type: string, format: uuid }
 *               coverUri: { type: string, format: uri }
 *               startDate: { type: string, example: "2026-06-15" }
 *               endDate: { type: string, example: "2026-06-17" }
 *               maxVolunteers: { type: integer, minimum: 1 }
 *     responses:
 *       '200':
 *         description: Project updated successfully.
 *       '400':
 *         description: Invalid input.
 *       '401':
 *         description: Unauthorized.
 *       '403':
 *         description: Forbidden — not the organizer.
 *       '404':
 *         description: Project or category not found.
 */
router.patch("/projects/:projectId", requireAuth, validateParams(ProjectIdSchema), validateBody(UpdateProjectSchema), asyncHandler(updateProject));

/**
 * @openapi
 * /projects/{projectId}/cancellations:
 *   post:
 *     summary: Cancel an active project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       '200':
 *         description: Project cancelled successfully.
 *       '401':
 *         description: Unauthorized.
 *       '403':
 *         description: Forbidden — not the organizer.
 *       '404':
 *         description: Project not found.
 *       '422':
 *         description: Project is already cancelled.
 */
router.post("/projects/:projectId/cancellations", requireAuth, validateParams(ProjectIdSchema), asyncHandler(cancelProject));

/**
 * @openapi
 * /projects/{projectId}/registrations:
 *   post:
 *     summary: Sign up as volunteer for a project
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       '201':
 *         description: Successfully enrolled.
 *       '401':
 *         description: Unauthorized.
 *       '404':
 *         description: Project not found.
 *       '422':
 *         description: Already enrolled or project is full/inactive.
 *   delete:
 *     summary: Cancel enrollment in a project
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       '200':
 *         description: Registration cancelled successfully.
 *       '401':
 *         description: Unauthorized.
 *       '404':
 *         description: Enrollment not found.
 *       '422':
 *         description: Enrollment is already cancelled.
 */
router.post("/projects/:projectId/registrations", requireAuth, validateParams(RegistrationParamsSchema), asyncHandler(signUp));
router.delete("/projects/:projectId/registrations", requireAuth, validateParams(RegistrationParamsSchema), asyncHandler(cancelRegistration));

/**
 * @openapi
 * /my-enrollments:
 *   get:
 *     summary: Get volunteer's own enrollments
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: List of volunteer's enrollments with project details.
 *       '401':
 *         description: Unauthorized.
 */
router.get("/my-enrollments", requireAuth, asyncHandler(getMyEnrollments));

export default router;