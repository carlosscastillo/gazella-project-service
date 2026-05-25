import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeSignUpController, makeCancelRegistrationController, makeGetMyEnrollmentsController } from "../controllers/registration_controller.js";
import type { Request, Response } from "express";

const mockExecuteCall = vi.fn();

const mockRegistrationClient = {
    signUp: vi.fn(),
    cancelRegistration: vi.fn(),
    getMyEnrollments: vi.fn()
};

const mockRes = () => {
    const res = {} as Response;
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
};

const volunteerAuth = {
    sub: "153c3105-a9d8-47c8-afe0-b260b8ee4136",
    email: "carlos@test.com",
    roles: ["volunteer"],
    permissions: []
};

beforeEach(() => {
    vi.clearAllMocks();
});

describe("makeSignUpController", () => {
    it("returns 201 with enrollmentId on success", async () => {
        const grpcResponse = { enrollment_id: "enroll-1", message: "Successfully signed up for the project" };
        mockExecuteCall.mockResolvedValue(grpcResponse);

        const req = {
            params: { projectId: "project-abc" },
            auth: volunteerAuth
        } as unknown as Request;
        const res = mockRes();

        const controller = makeSignUpController(mockRegistrationClient as any, mockExecuteCall);
        await controller(req as any, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            message: grpcResponse.message,
            enrollmentId: grpcResponse.enrollment_id
        });
    });

    it("returns 401 when auth is missing", async () => {
        const req = { params: { projectId: "project-abc" }, auth: undefined } as unknown as Request;
        const res = mockRes();

        const controller = makeSignUpController(mockRegistrationClient as any, mockExecuteCall);
        await controller(req as any, res);

        expect(res.status).toHaveBeenCalledWith(401);
    });

    it("propagates errors from executeCall", async () => {
        mockExecuteCall.mockRejectedValue(new Error("Project not found"));

        const req = {
            params: { projectId: "project-abc" },
            auth: volunteerAuth
        } as unknown as Request;
        const res = mockRes();

        const controller = makeSignUpController(mockRegistrationClient as any, mockExecuteCall);
        await expect(controller(req as any, res)).rejects.toThrow("Project not found");
    });
});

describe("makeCancelRegistrationController", () => {
    it("returns 200 with cancelled status", async () => {
        const grpcResponse = { enrollment_status: "Cancelled", message: "Registration cancelled successfully" };
        mockExecuteCall.mockResolvedValue(grpcResponse);

        const req = {
            params: { projectId: "project-abc" },
            auth: volunteerAuth
        } as unknown as Request;
        const res = mockRes();

        const controller = makeCancelRegistrationController(mockRegistrationClient as any, mockExecuteCall);
        await controller(req as any, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: grpcResponse.message,
            status: grpcResponse.enrollment_status
        });
    });

    it("returns 401 when auth is missing", async () => {
        const req = { params: { projectId: "project-abc" }, auth: undefined } as unknown as Request;
        const res = mockRes();

        const controller = makeCancelRegistrationController(mockRegistrationClient as any, mockExecuteCall);
        await controller(req as any, res);

        expect(res.status).toHaveBeenCalledWith(401);
    });
});

describe("makeGetMyEnrollmentsController", () => {
    it("returns 200 with enrollments list", async () => {
        const grpcResponse = {
            enrollments: [{ project_id: "abc", project_title: "Test", enrollment_status: "Confirmed" }]
        };
        mockExecuteCall.mockResolvedValue(grpcResponse);

        const req = { auth: volunteerAuth } as unknown as Request;
        const res = mockRes();

        const controller = makeGetMyEnrollmentsController(mockRegistrationClient as any, mockExecuteCall);
        await controller(req as any, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ myEnrollments: grpcResponse.enrollments });
    });

    it("returns 401 when auth is missing", async () => {
        const req = { auth: undefined } as unknown as Request;
        const res = mockRes();

        const controller = makeGetMyEnrollmentsController(mockRegistrationClient as any, mockExecuteCall);
        await controller(req as any, res);

        expect(res.status).toHaveBeenCalledWith(401);
    });
});