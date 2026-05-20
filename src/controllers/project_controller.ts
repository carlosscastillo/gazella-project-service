import { Request, Response } from "express";
import { ProjectGrpcClient } from "../grpc/projects/client.js";
import {
    GetProjectsRequest,
    GetProjectRequest,
    GetMyProjectsRequest,
    GetProjectVolunteersRequest
} from "../grpc/projects/types.js";
import { ExecuteCall } from "../grpc/grpc_util.js";
import { ProjectIdInput, GetProjectsQueryInput, GetProjectVolunteersQueryInput } from "../schemas/project_schema.js";
import { ControllerAuthorization, processAuthorization } from "../security/auth_util.js";
import { Organizer, ManageProjects } from "../security/authorizations.js";

export const makeGetProjectsController = (client: ProjectGrpcClient, executeCall: ExecuteCall) => {
    return async (req: Request, res: Response): Promise<void> => {
        const { pageIndex, pageSize, categoryId, searchTerm } = req.query as unknown as GetProjectsQueryInput;

        const request: GetProjectsRequest = {
            page_index: pageIndex,
            page_size: pageSize,
            category_id: categoryId,
            search_term: searchTerm
        };

        const response = await executeCall(client.getProjects(request));

        res.status(200).json({
            projects: response.projects,
            totalProjects: response.total_projects,
            currentPage: response.current_page,
            pageCount: response.page_count,
            pageSize: response.page_size
        });
    };
};

export const makeGetProjectController = (client: ProjectGrpcClient, executeCall: ExecuteCall) => {
    return async (req: Request<ProjectIdInput>, res: Response): Promise<void> => {
        const request: GetProjectRequest = {
            project_id: req.params.projectId
        };

        const response = await executeCall(client.getProject(request));

        res.status(200).json(response);
    };
};

export const makeGetMyProjectsController = (client: ProjectGrpcClient, executeCall: ExecuteCall) => {
    return async (req: Request, res: Response): Promise<void> => {
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

        const request: GetMyProjectsRequest = {
            organizer_id: req.auth?.sub as string
        };

        const response = await executeCall(client.getMyProjects(request));

        res.status(200).json({ myProjects: response.projects });
    };
};

export const makeGetProjectVolunteersController = (client: ProjectGrpcClient, executeCall: ExecuteCall) => {
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

        const { pageIndex, pageSize } = req.query as unknown as GetProjectVolunteersQueryInput;

        const request: GetProjectVolunteersRequest = {
            project_id: req.params.projectId,
            organizer_id: req.auth?.sub as string,
            page_index: pageIndex,
            page_size: pageSize
        };

        const response = await executeCall(client.getProjectVolunteers(request));

        res.status(200).json({
            volunteers: response.volunteers,
            totalVolunteers: response.total_volunteers,
            currentPage: response.current_page,
            pageCount: response.page_count,
            pageSize: response.page_size
        });
    };
};