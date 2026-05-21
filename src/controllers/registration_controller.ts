import { Request, Response } from "express";
import { RegistrationGrpcClient } from "../grpc/registrations/client.js";
import {
    SignUpRequest,
    CancelRegistrationRequest,
    GetMyEnrollmentsRequest
} from "../grpc/registrations/types.js";
import { ExecuteCall } from "../grpc/grpc_util.js";
import { RegistrationParamsInput } from "../schemas/registration_schema.js";
import { ControllerAuthorization, processAuthorization } from "../security/auth_util.js";
import { Volunteer, Organizer, Editor, Moderator, WriteProjects } from "../security/authorizations.js";

export const makeSignUpController = (client: RegistrationGrpcClient, executeCall: ExecuteCall) => {
    return async (req: Request<RegistrationParamsInput>, res: Response): Promise<void> => {
        const auth: ControllerAuthorization = {
            userId: req.auth?.sub,
            roles: req.auth?.roles,
            permissions: req.auth?.permissions,
            allowedRoles: [Volunteer, Organizer, Editor, Moderator],
            fineGrainedPermission: WriteProjects
        };

        const authResult = processAuthorization(auth);

        if (authResult.statusCode !== 200) {
            res.status(authResult.statusCode).json({ message: authResult.message, code: authResult.code });
            return;
        }

        const request: SignUpRequest = {
            project_id: req.params.projectId,
            volunteer_id: req.auth?.sub as string,
            volunteer_full_name: (req.auth?.["name"] as string) ?? "",
            volunteer_email: req.auth?.email as string ?? ""
        };

        const response = await executeCall(client.signUp(request));
        console.log(`[INFO] Volunteer ${request.volunteer_id} signed up for project ${request.project_id}. Enrollment: ${response.enrollment_id}`);

        res.status(201).json({ message: response.message, enrollmentId: response.enrollment_id });
    };
};

export const makeCancelRegistrationController = (client: RegistrationGrpcClient, executeCall: ExecuteCall) => {
    return async (req: Request<RegistrationParamsInput>, res: Response): Promise<void> => {
        const auth: ControllerAuthorization = {
            userId: req.auth?.sub,
            roles: req.auth?.roles,
            permissions: req.auth?.permissions,
            allowedRoles: [Volunteer, Organizer, Editor, Moderator],
            fineGrainedPermission: WriteProjects
        };

        const authResult = processAuthorization(auth);

        if (authResult.statusCode !== 200) {
            res.status(authResult.statusCode).json({ message: authResult.message, code: authResult.code });
            return;
        }

        const request: CancelRegistrationRequest = {
            project_id: req.params.projectId,
            volunteer_id: req.auth?.sub as string
        };

        const response = await executeCall(client.cancelRegistration(request));
        console.log(`[INFO] Volunteer ${request.volunteer_id} cancelled registration for project ${request.project_id}. Status: ${response.enrollment_status}`);

        res.status(200).json({ message: response.message, status: response.enrollment_status });
    };
};

export const makeGetMyEnrollmentsController = (client: RegistrationGrpcClient, executeCall: ExecuteCall) => {
    return async (req: Request, res: Response): Promise<void> => {
        const auth: ControllerAuthorization = {
            userId: req.auth?.sub,
            roles: req.auth?.roles,
            permissions: req.auth?.permissions,
            allowedRoles: [Volunteer, Organizer, Editor, Moderator],
            fineGrainedPermission: WriteProjects
        };

        const authResult = processAuthorization(auth);

        if (authResult.statusCode !== 200) {
            res.status(authResult.statusCode).json({ message: authResult.message, code: authResult.code });
            return;
        }

        const request: GetMyEnrollmentsRequest = {
            volunteer_id: req.auth?.sub as string
        };

        const response = await executeCall(client.getMyEnrollments(request));

        res.status(200).json({ myEnrollments: response.enrollments });
    };
};