import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeGetProjectsController, makeGetProjectController, makeGetMyProjectsController, makeGetProjectVolunteersController } from "../controllers/project_controller.js";
import type { Request, Response } from "express";

const mockExecuteCall = vi.fn();

const mockProjectClient = {
    getProjects: vi.fn(),
    getProject: vi.fn(),
    getMyProjects: vi.fn(),
    getProjectVolunteers: vi.fn()
};

const mockRes = () => {
    const res = {} as Response;
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
};

const mockReq = (overrides = {}) => ({
    parsedQuery: {},
    params: {},
    auth: {
        sub: "153c3105-a9d8-47c8-afe0-b260b8ee4136",
        email: "carlos@test.com",
        roles: ["organizer"],
        permissions: []
    },
    ...overrides
}) as unknown as Request;

beforeEach(() => {
    vi.clearAllMocks();
});

describe("makeGetProjectsController", () => {
    it("returns 200 with projects list", async () => {
        const grpcResponse = {
            projects: [{ project_id: "abc", title: "Test" }],
            total_projects: 1, current_page: 1, page_count: 1, page_size: 10
        };
        mockExecuteCall.mockResolvedValue(grpcResponse);
        mockProjectClient.getProjects.mockReturnValue(Promise.resolve(grpcResponse));

        const req = mockReq({ parsedQuery: { pageIndex: 1, pageSize: 10, categoryId: "", searchTerm: "", location: "", startDate: "", orderBy: "newest" } });
        const res = mockRes();

        const controller = makeGetProjectsController(mockProjectClient as any, mockExecuteCall);
        await controller(req as any, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            projects: grpcResponse.projects,
            totalProjects: 1
        }));
    });

    it("propagates errors from executeCall", async () => {
        mockExecuteCall.mockRejectedValue(new Error("gRPC error"));
        const req = mockReq({ parsedQuery: { pageIndex: 1, pageSize: 10, categoryId: "", searchTerm: "", location: "", startDate: "", orderBy: "newest" } });
        const res = mockRes();

        const controller = makeGetProjectsController(mockProjectClient as any, mockExecuteCall);
        await expect(controller(req as any, res)).rejects.toThrow("gRPC error");
    });
});

describe("makeGetProjectController", () => {
    it("returns 200 with project detail", async () => {
        const grpcResponse = { project_id: "abc", title: "Test Project", status: "Active" };
        mockExecuteCall.mockResolvedValue(grpcResponse);

        const req = mockReq({ params: { projectId: "abc" } });
        const res = mockRes();

        const controller = makeGetProjectController(mockProjectClient as any, mockExecuteCall);
        await controller(req as any, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(grpcResponse);
    });
});

describe("makeGetMyProjectsController", () => {
    it("returns 200 with organizer projects", async () => {
        const grpcResponse = { projects: [{ project_id: "abc", title: "My Project" }] };
        mockExecuteCall.mockResolvedValue(grpcResponse);

        const req = mockReq();
        const res = mockRes();

        const controller = makeGetMyProjectsController(mockProjectClient as any, mockExecuteCall);
        await controller(req as any, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ myProjects: grpcResponse.projects });
    });

    it("returns 403 when user is not organizer", async () => {
        const req = mockReq({ auth: { sub: "user-1", email: "vol@test.com", roles: ["volunteer"], permissions: [] } });
        const res = mockRes();

        const controller = makeGetMyProjectsController(mockProjectClient as any, mockExecuteCall);
        await controller(req as any, res);

        expect(res.status).toHaveBeenCalledWith(403);
    });

    it("returns 401 when auth is missing", async () => {
        const req = mockReq({ auth: undefined });
        const res = mockRes();

        const controller = makeGetMyProjectsController(mockProjectClient as any, mockExecuteCall);
        await controller(req as any, res);

        expect(res.status).toHaveBeenCalledWith(401);
    });
});

describe("makeGetProjectVolunteersController", () => {
    it("returns 200 with volunteers list", async () => {
        const grpcResponse = {
            volunteers: [{ volunteer_id: "vol-1", full_name: "Test" }],
            total_volunteers: 1, current_page: 1, page_count: 1, page_size: 10
        };
        mockExecuteCall.mockResolvedValue(grpcResponse);

        const req = mockReq({
            params: { projectId: "abc" },
            parsedQuery: { pageIndex: 1, pageSize: 10, searchTerm: "", statusFilter: "all" }
        });
        const res = mockRes();

        const controller = makeGetProjectVolunteersController(mockProjectClient as any, mockExecuteCall);
        await controller(req as any, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            volunteers: grpcResponse.volunteers,
            totalVolunteers: 1
        }));
    });

    it("returns 403 when user is not organizer", async () => {
        const req = mockReq({
            params: { projectId: "abc" },
            parsedQuery: { pageIndex: 1, pageSize: 10, searchTerm: "", statusFilter: "all" },
            auth: { sub: "vol-1", email: "vol@test.com", roles: ["volunteer"], permissions: [] }
        });
        const res = mockRes();

        const controller = makeGetProjectVolunteersController(mockProjectClient as any, mockExecuteCall);
        await controller(req as any, res);

        expect(res.status).toHaveBeenCalledWith(403);
    });
});