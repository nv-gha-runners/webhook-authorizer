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
  const env = process.env;

  beforeEach(() => {
    mockDeleteInstallation.mockClear();
    jest.resetModules();
    process.env = { ...env, PRIVATE_KEY: "1234" };
  });

  afterEach(() => {
    process.env = env;
  });

  test("unauthorized installation created | delete success", async () => {
    mockDeleteInstallation.mockResolvedValueOnce("deleted successfully");
    const result = await authorizer({
      allowedOrgs: ["rapidsai"],
      event: makeInstallationEvent({
        action: "created",
        orgName: "unauthorized_org",
      }),
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
    });
    expect(result).toStrictEqual({
      msg: "Unauthorized organization detected. Automatic uninstall failed.",
      httpCode: 500,
      isAuthorized: false,
    });
  });

  test("unauthorized installation created | delete failed | missing PRIVATE_KEY", async () => {
    delete process.env.PRIVATE_KEY;
    const result = await authorizer({
      allowedOrgs: ["rapidsai"],
      event: makeInstallationEvent({
        action: "created",
        orgName: "unauthorized_org",
      }),
    });
    expect(mockDeleteInstallation).not.toHaveBeenCalled();
    expect(result).toStrictEqual({
      msg: "Unauthorized organization detected. Automatic uninstall failed.",
      httpCode: 500,
      isAuthorized: false,
    });
  });

  test("installation deleted (no org object)", async () => {
    const result = await authorizer({
      allowedOrgs: ["rapidsai"],
      event: makeInstallationEvent({
        action: "deleted",
        orgName: "unauthorized_org",
      }),
    });
    expect(mockDeleteInstallation).not.toHaveBeenCalled();
    expect(result).toStrictEqual({
      msg: "Unable to determine organization, no further processing will occur.",
      httpCode: 200,
      isAuthorized: false,
    });
  });

  test("issue_comment created | delete success", async () => {
    mockDeleteInstallation.mockReturnValueOnce("deleted successfully");
    const result = await authorizer({
      allowedOrgs: ["rapidsai"],
      event: makeIssueCommentEvent({
        orgName: "unauthorized_org",
      }),
    });
    expect(result).toStrictEqual({
      msg: "Organization is not authorized to use this application. Installation deleted.",
      httpCode: 200,
      isAuthorized: false,
    });
  });

  test("issue_comment created | delete failed", async () => {
    mockDeleteInstallation.mockRejectedValueOnce("error deleting installation");
    const result = await authorizer({
      allowedOrgs: ["rapidsai"],
      event: makeIssueCommentEvent({
        orgName: "unauthorized_org",
      }),
    });
    expect(result).toStrictEqual({
      msg: "Unauthorized organization detected. Automatic uninstall failed.",
      httpCode: 500,
      isAuthorized: false,
    });
  });

  test("issue_comment created | delete success", async () => {
    mockDeleteInstallation.mockReturnValueOnce("deleted successfully");
    const result = await authorizer({
      allowedOrgs: ["rapidsai"],
      event: makeIssueCommentEvent({
        orgName: "rapidsai",
      }),
    });
    expect(result).toStrictEqual({
      msg: "Organization is authorized.",
      httpCode: 200,
      isAuthorized: true,
    });
  });
});
