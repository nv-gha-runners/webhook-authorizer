import { authorizer } from "../src";
import { makeInstallationEvent } from "./webhooks/installation";
import { makeIssueCommentEvent } from "./webhooks/issue_comment";

const mockDeleteInstallation = jest.fn().mockName("deleteInstallation");
jest.mock("@octokit/rest", () => ({
  Octokit: jest.fn().mockImplementation(() => ({
    rest: {
      apps: {
        deleteInstallation: mockDeleteInstallation,
      },
    },
  })),
}));

describe("default", () => {
  beforeEach(() => {
    mockDeleteInstallation.mockClear();
    jest.resetModules();
  });

  test("unauthorized installation created | delete success", async () => {
    mockDeleteInstallation.mockResolvedValueOnce("deleted successfully");
    const result = await authorizer({
      allowedOrgs: ["rapidsai"],
      event: makeInstallationEvent({
        action: "created",
        orgName: "unauthorized_org",
      }),
      privateKey: "1234",
    });
    expect(result).toStrictEqual({
      msg: "Application was automatically uninstalled from an unauthorized account.",
      httpCode: 200,
      isAuthorized: false,
    });
  });

  test("unauthorized installation created | delete failed | octokit", async () => {
    mockDeleteInstallation.mockRejectedValueOnce("error deleting installation");
    const result = await authorizer({
      allowedOrgs: ["rapidsai"],
      event: makeInstallationEvent({
        action: "created",
        orgName: "unauthorized_org",
      }),
      privateKey: "1234",
    });
    expect(result).toStrictEqual({
      msg: "Unauthorized organization detected. Automatic uninstall failed.",
      httpCode: 500,
      isAuthorized: false,
    });
  });

  test("authorized installation created", async () => {
    const result = await authorizer({
      allowedOrgs: ["rapidsai"],
      event: makeInstallationEvent({
        action: "created",
        orgName: "rapidsai",
      }),
      privateKey: "1234",
    });
    expect(mockDeleteInstallation).not.toHaveBeenCalled();
    expect(result).toStrictEqual({
      msg: "New installation from authorized organization.",
      httpCode: 200,
      isAuthorized: true,
    });
  });

  test("authorized installation created (case insensitive 1)", async () => {
    const result = await authorizer({
      allowedOrgs: ["RAPIDSAI"],
      event: makeInstallationEvent({
        action: "created",
        orgName: "rapidsai",
      }),
      privateKey: "1234",
    });
    expect(mockDeleteInstallation).not.toHaveBeenCalled();
    expect(result).toStrictEqual({
      msg: "New installation from authorized organization.",
      httpCode: 200,
      isAuthorized: true,
    });
  });

  test("authorized installation created (case insensitive 2)", async () => {
    const result = await authorizer({
      allowedOrgs: ["rapidsai"],
      event: makeInstallationEvent({
        action: "created",
        orgName: "RAPIDSAI",
      }),
      privateKey: "1234",
    });
    expect(mockDeleteInstallation).not.toHaveBeenCalled();
    expect(result).toStrictEqual({
      msg: "New installation from authorized organization.",
      httpCode: 200,
      isAuthorized: true,
    });
  });

  test("installation deleted (no org object)", async () => {
    const result = await authorizer({
      allowedOrgs: ["rapidsai"],
      event: makeInstallationEvent({
        action: "deleted",
        orgName: "unauthorized_org",
      }),
      privateKey: "1234",
    });
    expect(mockDeleteInstallation).not.toHaveBeenCalled();
    expect(result).toStrictEqual({
      msg: "Unable to determine organization, no further processing will occur.",
      httpCode: 200,
      isAuthorized: false,
    });
  });

  test("unauthorized org issue_comment | delete success", async () => {
    mockDeleteInstallation.mockReturnValueOnce("deleted successfully");
    const result = await authorizer({
      allowedOrgs: ["rapidsai"],
      event: makeIssueCommentEvent({
        orgName: "unauthorized_org",
      }),
      privateKey: "1234",
    });
    expect(result).toStrictEqual({
      msg: "Organization is not authorized to use this application. Installation deleted.",
      httpCode: 200,
      isAuthorized: false,
    });
  });

  test("unauthorized org issue_comment | delete failed", async () => {
    mockDeleteInstallation.mockRejectedValueOnce("error deleting installation");
    const result = await authorizer({
      allowedOrgs: ["rapidsai"],
      event: makeIssueCommentEvent({
        orgName: "unauthorized_org",
      }),
      privateKey: "1234",
    });
    expect(result).toStrictEqual({
      msg: "Unauthorized organization detected. Automatic uninstall failed.",
      httpCode: 500,
      isAuthorized: false,
    });
  });

  test("authorized org issue_comment", async () => {
    mockDeleteInstallation.mockReturnValueOnce("deleted successfully");
    const result = await authorizer({
      allowedOrgs: ["rapidsai"],
      event: makeIssueCommentEvent({
        orgName: "rapidsai",
      }),
      privateKey: "1234",
    });
    expect(result).toStrictEqual({
      msg: "Organization is authorized.",
      httpCode: 200,
      isAuthorized: true,
    });
  });

  test("authorized org issue_comment (case insensitive 1)", async () => {
    mockDeleteInstallation.mockReturnValueOnce("deleted successfully");
    const result = await authorizer({
      allowedOrgs: ["rapidsai"],
      event: makeIssueCommentEvent({
        orgName: "RAPIDSAI",
      }),
      privateKey: "1234",
    });
    expect(result).toStrictEqual({
      msg: "Organization is authorized.",
      httpCode: 200,
      isAuthorized: true,
    });
  });

  test("authorized org issue_comment (case insensitive 2)", async () => {
    mockDeleteInstallation.mockReturnValueOnce("deleted successfully");
    const result = await authorizer({
      allowedOrgs: ["RAPIDSAI"],
      event: makeIssueCommentEvent({
        orgName: "rapidsai",
      }),
      privateKey: "1234",
    });
    expect(result).toStrictEqual({
      msg: "Organization is authorized.",
      httpCode: 200,
      isAuthorized: true,
    });
  });
});
