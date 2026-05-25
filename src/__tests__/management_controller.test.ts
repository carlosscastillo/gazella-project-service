import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeCreateProjectController, makeUpdateProjectController, makeCancelProjectController } from "../controllers/management_controller.js";
import type { Request, Response } from "express";

const mockExecuteCall = vi.fn();

const mockManagementClient = {
    createProject: vi.fn(),
    updateProject: vi.fn(),
    cancelProject: vi.fn()
};

const mockRes = () => {
    const res = {} as Response;
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
};

const organizerAuth = {
    sub: "153c3105-a9d8-47c8-afe0-b260b8ee4136",
    email: "carlos@test.com",
    roles: ["organizer"],
    permissions: []
};

const createBody = {
    title: "Reforestación",
    description: "Proyecto de reforestación",
    location: "Xalapa, Veracruz",
    categoryId: "550e8400-e29b-41d4-a716-446655440001",
    organizerId: "153c3105-a9d8-47c8-afe0-b260b8ee4136",
    organizerName: "Carlos Castillo",
    startDate: "2026-06-15",
    endDate: "2026-06-16",
    maxVolunteers: 20,
    isDraft: false
};

beforeEach(() => {
    vi.clearAllMocks();
});

describe("makeCreateProjectController", () => {
    it("returns 201 with projectId on success", async () => {
        const grpcResponse = { project_id: "new-id", message: "Project created successfully" };
        mockExecuteCall.mockResolvedValue(grpcResponse);

        const req = { body: createBody, auth: organizerAuth } as unknown as Request;
        const res = mockRes();

        const controller = makeCreateProjectController(mockManagementClient as any, mockExecuteCall);
        await controller(req as any, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ message: grpcResponse.message, projectId: grpcResponse.project_id });
    });

    it("returns 403 when organizerId does not match sub", async () => {
        const req = {
            body: { ...createBody, organizerId: "different-id" },
            auth: organizerAuth
        } as unknown as Request;
        const res = mockRes();

        const controller = makeCreateProjectController(mockManagementClient as any, mockExecuteCall);
        await controller(req as any, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: "ORGANIZER_MISMATCH" }));
    });

    it("returns 403 when user is not organizer", async () => {
        const req = {
            body: createBody,
            auth: { sub: "vol-1", email: "vol@test.com", roles: ["volunteer"], permissions: [] }
        } as unknown as Request;
        const res = mockRes();

        const controller = makeCreateProjectController(mockManagementClient as any, mockExecuteCall);
        await controller(req as any, res);

        expect(res.status).toHaveBeenCalledWith(403);
    });

    it("returns 401 when auth is missing", async () => {
        const req = { body: createBody, auth: undefined } as unknown as Request;
        const res = mockRes();

        const controller = makeCreateProjectController(mockManagementClient as any, mockExecuteCall);
        await controller(req as any, res);

        expect(res.status).toHaveBeenCalledWith(401);
    });
});

describe("makeUpdateProjectController", () => {
    const updateBody = {
        title: "Actualizado",
        description: "Nueva descripción",
        location: "Xalapa",
        categoryId: "550e8400-e29b-41d4-a716-446655440001",
        startDate: "2026-06-15",
        endDate: "2026-06-17",
        maxVolunteers: 25
    };

    it("returns 200 on successful update", async () => {
        const grpcResponse = { is_success: true, message: "Project updated successfully" };
        mockExecuteCall.mockResolvedValue(grpcResponse);

        const req = {
            params: { projectId: "abc" },
            body: updateBody,
            auth: organizerAuth
        } as unknown as Request;
        const res = mockRes();

        const controller = makeUpdateProjectController(mockManagementClient as any, mockExecuteCall);
        await controller(req as any, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: grpcResponse.message });
    });

    it("returns 403 when user is not organizer", async () => {
        const req = {
            params: { projectId: "abc" },
            body: updateBody,
            auth: { sub: "vol-1", email: "vol@test.com", roles: ["volunteer"], permissions: [] }
        } as unknown as Request;
        const res = mockRes();

        const controller = makeUpdateProjectController(mockManagementClient as any, mockExecuteCall);
        await controller(req as any, res);

        expect(res.status).toHaveBeenCalledWith(403);
    });
});

describe("makeCancelProjectController", () => {
    it("returns 200 on successful cancellation", async () => {
        const grpcResponse = { project_status: "Cancelled", message: "Project cancelled successfully" };
        mockExecuteCall.mockResolvedValue(grpcResponse);

        const req = {
            params: { projectId: "abc" },
            auth: organizerAuth
        } as unknown as Request;
        const res = mockRes();

        const controller = makeCancelProjectController(mockManagementClient as any, mockExecuteCall);
        await controller(req as any, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: grpcResponse.message, status: grpcResponse.project_status });
    });

    it("returns 403 when user is not organizer", async () => {
        const req = {
            params: { projectId: "abc" },
            auth: { sub: "vol-1", email: "vol@test.com", roles: ["volunteer"], permissions: [] }
        } as unknown as Request;
        const res = mockRes();

        const controller = makeCancelProjectController(mockManagementClient as any, mockExecuteCall);
        await controller(req as any, res);

        expect(res.status).toHaveBeenCalledWith(403);
    });
});