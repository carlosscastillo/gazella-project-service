import { Request, Response } from "express";
import { ProjectManagementGrpcClient } from "../grpc/management/client.js";
import {
    CreateProjectRequest,
    UpdateProjectRequest,
    CancelProjectRequest
} from "../grpc/management/types.js";
import { ExecuteCall } from "../grpc/grpc_util.js";
import { CreateProjectInput, UpdateProjectInput } from "../schemas/management_schema.js";
import { ProjectIdInput } from "../schemas/project_schema.js";
import { ControllerAuthorization, processAuthorization } from "../security/auth_util.js";
import { Organizer, ManageProjects } from "../security/authorizations.js";
import { publishEvent } from "../messaging/rabbitmq.js";
import { ProjectGrpcClient } from "../grpc/projects/client.js";

type ManagementService = {
    client: ProjectManagementGrpcClient;
    executeCall: ExecuteCall;
};

export const makeCreateProjectController = (client: ProjectManagementGrpcClient, executeCall: ExecuteCall) => {
    return async (req: Request<{}, {}, CreateProjectInput>, res: Response): Promise<void> => {
        const auth: ControllerAuthorization = {
            userId: req.auth?.sub,
            roles: req.auth?.roles,
            permissions: req.auth?.permissions,
            allowedRoles: [Organizer],
            fineGrainedPermission: ManageProjects
        };

        const authResult = processAuthorization(auth);

        if (authResult.statusCode !== 200) {
            res.status(authResult.statusCode).json({ message: authResult.message, code: authResult.code });
            return;
        }

        const userId = req.auth?.sub;
        const projectData = req.body;

        if (projectData.organizerId !== userId) {
            res.status(403).json({ message: "Subject and organizerId don't match.", code: "ORGANIZER_MISMATCH" });
            return;
        }

        const response = await createProject({ client, executeCall }, projectData);

        res.status(201).json({ message: response.message, projectId: response.project_id });
    };
};

async function createProject(service: ManagementService, data: CreateProjectInput) {
    const request: CreateProjectRequest = {
        title: data.title,
        description: data.description,
        cover_uri: data.coverUri || "",
        location: data.location,
        category_id: data.categoryId,
        organizer_id: data.organizerId,
        organizer_name: data.organizerName,
        organizer_pfp_uri: data.organizerPfpUri || "",
        start_date: data.startDate,
        end_date: data.endDate,
        max_volunteers: data.maxVolunteers,
        is_draft: data.isDraft
    };

    const response = await service.executeCall(service.client.createProject(request));
    console.log(`[INFO] Project created with id: ${response.project_id}`);

    return response;
}

export const makeUpdateProjectController = (client: ProjectManagementGrpcClient, executeCall: ExecuteCall) => {
    return async (req: Request<ProjectIdInput, {}, UpdateProjectInput>, res: Response): Promise<void> => {
        const auth: ControllerAuthorization = {
            userId: req.auth?.sub,
            roles: req.auth?.roles,
            permissions: req.auth?.permissions,
            allowedRoles: [Organizer],
            fineGrainedPermission: ManageProjects
        };

        const authResult = processAuthorization(auth);

        if (authResult.statusCode !== 200) {
            res.status(authResult.statusCode).json({ message: authResult.message, code: authResult.code });
            return;
        }

        const response = await updateProject({ client, executeCall }, req.params.projectId, req.auth?.sub as string, req.body);

        res.status(200).json({ message: response.message });
    };
};

async function updateProject(service: ManagementService, projectId: string, organizerId: string, data: UpdateProjectInput) {
    const request: UpdateProjectRequest = {
        project_id: projectId,
        organizer_id: organizerId,
        title: data.title,
        description: data.description,
        cover_uri: data.coverUri || "",
        location: data.location,
        category_id: data.categoryId,
        start_date: data.startDate,
        end_date: data.endDate,
        max_volunteers: data.maxVolunteers
    };

    const response = await service.executeCall(service.client.updateProject(request));
    console.log(`[INFO] Project updated. Id: ${projectId}`);

    return response;
}

export const makeCancelProjectController = (client: ProjectManagementGrpcClient, projectClient: ProjectGrpcClient, executeCall: ExecuteCall) => {
    return async (req: Request<ProjectIdInput>, res: Response): Promise<void> => {
        const auth: ControllerAuthorization = {
            userId: req.auth?.sub,
            roles: req.auth?.roles,
            permissions: req.auth?.permissions,
            allowedRoles: [Organizer],
            fineGrainedPermission: ManageProjects
        };

        const authResult = processAuthorization(auth);

        if (authResult.statusCode !== 200) {
            res.status(authResult.statusCode).json({ message: authResult.message, code: authResult.code });
            return;
        }

        const response = await cancelProject({ client, executeCall }, projectClient, req.params.projectId, req.auth?.sub as string);

        res.status(200).json({ message: response.message, status: response.project_status });
    };
};

async function cancelProject(service: ManagementService, projectClient: ProjectGrpcClient, projectId: string, organizerId: string) {
    const request: CancelProjectRequest = {
        project_id: projectId,
        organizer_id: organizerId
    };

    const response = await service.executeCall(service.client.cancelProject(request));
    console.log(`[INFO] Project cancelled. Id: ${projectId}, Status: ${response.project_status}`);

    try {
        const volunteersResponse = await service.executeCall(
            projectClient.getProjectVolunteers({
                project_id: projectId,
                organizer_id: organizerId,
                page_index: 1,
                page_size: 1000,
                search_term: "",
                status_filter: "confirmed"
            })
        );

        const projectData = await service.executeCall(
            projectClient.getProject({ project_id: projectId })
        );

        for (const volunteer of volunteersResponse.volunteers) {
            await publishEvent("project.cancelled.volunteer", {
                eventKey: "PROJECT_CANCELLED",
                projectId,
                organizerId,
                volunteerId: volunteer.volunteer_id,
                volunteerEmail: volunteer.email,
                volunteerName: volunteer.full_name,
                projectTitle: projectData.title,
            });
        }
        console.log(`[INFO] Published cancellation events for ${volunteersResponse.volunteers.length} volunteers`);
    } catch (err) {
        console.warn("[WARN] Could not publish volunteer cancellation events:", err);
    }

    return response;
}