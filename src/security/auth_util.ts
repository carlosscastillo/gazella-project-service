export type ControllerAuthorization = {
    userId: string | undefined;
    roles: string[] | undefined;
    permissions: string[] | undefined;
    allowedRoles: string[];
    fineGrainedPermission: string;
};

export type AuthorizationResult = {
    statusCode: number;
    message: string;
    code: string;
};

export function processAuthorization(auth: ControllerAuthorization): AuthorizationResult {
    if (!auth.userId) {
        return {
            statusCode: 401,
            message: "Invalid Token or subject is missing (sub)",
            code: "MISSING_SUB"
        }
    }

    const roles = auth.roles || [];
    const permissions = auth.permissions || [];
    const isAuthorized = 
        roles.some(role => auth.allowedRoles.map(r => r.toLowerCase().includes(role.toLowerCase()))) || 
        permissions.some((p) => p.toLowerCase() === auth.fineGrainedPermission.toLowerCase());

    if (!isAuthorized) {
        return {
            statusCode: 403,
            message: "You do not have permission to access this function or content",
            code: "FORBIDDEN"
        }
    }

    return {
        statusCode: 200,
        message: "Authorized, continue",
        code: "OK"
    }
}
