import { APIGatewayProxyEvent } from "aws-lambda";
import { Octokit } from "@octokit/rest";
import { authorizer } from "../src";
import {
  makeLambdaEvent,
  WEBHOOK_SECRET,
  WebhookSignatureOptions,
} from "./lambda_event";
import { makeInstallationEvent } from "./webhooks/installation";
import { makeIssueCommentEvent } from "./webhooks/issue_comment";

const mockGetInstallation = jest.fn().mockName("getInstallation");
const mockDeleteInstallation = jest.fn().mockName("deleteInstallation");
jest.mock("@octokit/rest", () => ({
  Octokit: jest.fn().mockImplementation(() => ({
    rest: {
      apps: {
        getInstallation: mockGetInstallation,
        deleteInstallation: mockDeleteInstallation,
      },
    },
  })),
}));

const APP_ID = 281868;
const PRIVATE_KEY = "test-private-key";
const AUTHORIZER_CREDENTIALS = {
  appId: APP_ID,
  privateKey: PRIVATE_KEY,
  webhookSecret: WEBHOOK_SECRET,
};

const INVALID_SIGNATURE_RESPONSE = {
  msg: "Webhook signature is missing or invalid.",
  httpCode: 401,
  isAuthorized: false,
};

const UNINSTALL_FAILED_RESPONSE = {
  msg: "Unauthorized organization detected. Automatic uninstall failed.",
  httpCode: 500,
  isAuthorized: false,
};

beforeEach(() => {
  (Octokit as unknown as jest.Mock).mockClear();
  mockGetInstallation.mockReset();
  mockDeleteInstallation.mockReset();
});

const signatureCases: {
  name: string;
  options: WebhookSignatureOptions;
  valid: boolean;
}[] = [
  { name: "valid", options: {}, valid: true },
  { name: "missing", options: { signature: null }, valid: false },
  {
    name: "invalid",
    options: { signature: `sha256=${"0".repeat(64)}` },
    valid: false,
  },
];

describe.each([
  {
    name: "allowed organization",
    account: "rapidsai",
    accountType: "Organization" as const,
    allowed: true,
  },
  {
    name: "disallowed organization",
    account: "unauthorized_org",
    accountType: "Organization" as const,
    allowed: false,
  },
  {
    name: "personal account with an allowlisted login",
    account: "octocat",
    accountType: "User" as const,
    allowed: false,
  },
])("installation webhook from $name", ({ account, accountType, allowed }) => {
  beforeEach(() => {
    mockGetInstallation.mockResolvedValue({
      data: {
        id: 33174052,
        account: {
          id: 45887043,
          login: account,
        },
      },
    });
    mockDeleteInstallation.mockResolvedValue("deleted successfully");
  });

  test.each(signatureCases)("$name signature", async ({ options, valid }) => {
    const result = await authorizer({
      allowedOrgs: ["rapidsai"],
      event: makeInstallationEvent({
        action: "created",
        orgName: account,
        accountType,
        signature: options,
      }),
      ...AUTHORIZER_CREDENTIALS,
    });

    if (!valid) {
      expect(result).toStrictEqual(INVALID_SIGNATURE_RESPONSE);
      expect(mockGetInstallation).not.toHaveBeenCalled();
      expect(mockDeleteInstallation).not.toHaveBeenCalled();
      return;
    }

    expect(result).toStrictEqual(
      allowed
        ? {
            msg: "New installation from authorized organization.",
            httpCode: 200,
            isAuthorized: true,
          }
        : {
            msg: "Application was automatically uninstalled from an unauthorized account.",
            httpCode: 200,
            isAuthorized: false,
          },
    );
    expect(mockGetInstallation).toHaveBeenCalledTimes(allowed ? 0 : 1);
    expect(mockDeleteInstallation).toHaveBeenCalledTimes(allowed ? 0 : 1);
    if (!allowed) {
      expect(Octokit).toHaveBeenCalledWith(
        expect.objectContaining({
          auth: {
            appId: APP_ID,
            privateKey: PRIVATE_KEY,
          },
        }),
      );
    }
  });
});

test("installation fixture uses the Lambda Function URL payload shape", () => {
  const event = makeInstallationEvent({
    action: "created",
    orgName: "rapidsai",
  });

  expect(event.version).toBe("2.0");
  expect(event.routeKey).toBe("$default");
  expect(event.headers["x-github-event"]).toBe("installation");
  expect(event.headers["x-hub-signature-256"]).toBeDefined();
  expect(event.headers["X-GitHub-Event"]).toBeUndefined();
});

test("authorized organization issue_comment", async () => {
  const result = await authorizer({
    allowedOrgs: ["RAPIDSAI"],
    event: makeIssueCommentEvent({ orgName: "rapidsai" }),
    ...AUTHORIZER_CREDENTIALS,
  });

  expect(result).toStrictEqual({
    msg: "Organization is authorized.",
    httpCode: 200,
    isAuthorized: true,
  });
});

test("unauthorized organization issue_comment is uninstalled after identity verification", async () => {
  mockGetInstallation.mockResolvedValueOnce({
    data: {
      id: 33169462,
      account: {
        id: 104869010,
        login: "unauthorized_org",
      },
    },
  });
  mockDeleteInstallation.mockResolvedValueOnce("deleted successfully");

  const result = await authorizer({
    allowedOrgs: ["rapidsai"],
    event: makeIssueCommentEvent({ orgName: "unauthorized_org" }),
    ...AUTHORIZER_CREDENTIALS,
  });

  expect(result).toStrictEqual({
    msg: "Organization is not authorized to use this application. Installation deleted.",
    httpCode: 200,
    isAuthorized: false,
  });
  expect(mockGetInstallation).toHaveBeenCalledWith({
    installation_id: 33169462,
  });
  expect(mockDeleteInstallation).toHaveBeenCalledWith({
    installation_id: 33169462,
  });
});

test("invalid signature is rejected before parsing JSON", async () => {
  const event = {
    headers: {
      "x-github-event": "installation",
      "x-hub-signature-256": `sha256=${"0".repeat(64)}`,
    },
    body: "not json",
    isBase64Encoded: false,
  } as unknown as APIGatewayProxyEvent;

  await expect(
    authorizer({
      allowedOrgs: ["rapidsai"],
      event,
      ...AUTHORIZER_CREDENTIALS,
    }),
  ).resolves.toStrictEqual(INVALID_SIGNATURE_RESPONSE);
  expect(mockGetInstallation).not.toHaveBeenCalled();
  expect(mockDeleteInstallation).not.toHaveBeenCalled();
});

test("base64-encoded bodies are verified against decoded bytes", async () => {
  const event = makeLambdaEvent("issue_comment", {
    organization: { login: "rapidsai" },
  });
  event.body = Buffer.from(event.body as string).toString("base64");
  event.isBase64Encoded = true;

  const result = await authorizer({
    allowedOrgs: ["rapidsai"],
    event,
    ...AUTHORIZER_CREDENTIALS,
  });

  expect(result.isAuthorized).toBe(true);
});

test("installation deleted without an organization is not forwarded", async () => {
  const result = await authorizer({
    allowedOrgs: ["rapidsai"],
    event: makeInstallationEvent({
      action: "deleted",
      orgName: "unauthorized_org",
    }),
    ...AUTHORIZER_CREDENTIALS,
  });

  expect(result).toStrictEqual({
    msg: "Unable to determine organization, no further processing will occur.",
    httpCode: 200,
    isAuthorized: false,
  });
});

test.each([
  {
    name: "installation ID",
    installationId: 1,
    accountId: 45887043,
    accountLogin: "unauthorized_org",
  },
  {
    name: "account ID",
    installationId: 33174052,
    accountId: 1,
    accountLogin: "unauthorized_org",
  },
  {
    name: "account login",
    installationId: 33174052,
    accountId: 45887043,
    accountLogin: "different-account",
  },
])("$name mismatch is not deleted", async ({
  installationId,
  accountId,
  accountLogin,
}) => {
  mockGetInstallation.mockResolvedValueOnce({
    data: {
      id: installationId,
      account: {
        id: accountId,
        login: accountLogin,
      },
    },
  });

  const result = await authorizer({
    allowedOrgs: ["rapidsai"],
    event: makeInstallationEvent({
      action: "created",
      orgName: "unauthorized_org",
    }),
    ...AUTHORIZER_CREDENTIALS,
  });

  expect(result).toStrictEqual(UNINSTALL_FAILED_RESPONSE);
  expect(mockDeleteInstallation).not.toHaveBeenCalled();
});

test("installation lookup failure is returned without deleting", async () => {
  mockGetInstallation.mockRejectedValueOnce(
    new Error("installation lookup failed"),
  );

  const result = await authorizer({
    allowedOrgs: ["rapidsai"],
    event: makeInstallationEvent({
      action: "created",
      orgName: "unauthorized_org",
    }),
    ...AUTHORIZER_CREDENTIALS,
  });

  expect(result).toStrictEqual(UNINSTALL_FAILED_RESPONSE);
  expect(mockDeleteInstallation).not.toHaveBeenCalled();
});

test("installation deletion failure is returned", async () => {
  mockGetInstallation.mockResolvedValueOnce({
    data: {
      id: 33174052,
      account: {
        id: 45887043,
        login: "unauthorized_org",
      },
    },
  });
  mockDeleteInstallation.mockRejectedValueOnce(
    new Error("installation deletion failed"),
  );

  const result = await authorizer({
    allowedOrgs: ["rapidsai"],
    event: makeInstallationEvent({
      action: "created",
      orgName: "unauthorized_org",
    }),
    ...AUTHORIZER_CREDENTIALS,
  });

  expect(result).toStrictEqual(UNINSTALL_FAILED_RESPONSE);
});
