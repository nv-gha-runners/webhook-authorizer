import { APIGatewayProxyEvent } from "aws-lambda";
import { authorizer } from "../src";
import {
  makeLambdaEvent,
  WEBHOOK_SECRET,
  WebhookSignatureOptions,
} from "./lambda_event";
import { makeInstallationEvent } from "./webhooks/installation";
import { makeIssueCommentEvent } from "./webhooks/issue_comment";

const INVALID_SIGNATURE_RESPONSE = {
  msg: "Webhook signature is missing or invalid.",
  httpCode: 401,
  isAuthorized: false,
};

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
  { account: "rapidsai", allowed: true },
  { account: "unauthorized_org", allowed: false },
])("installation webhook from $account", ({ account, allowed }) => {
  test.each(signatureCases)("$name signature", async ({ options, valid }) => {
    const result = await authorizer({
      allowedOrgs: ["rapidsai"],
      event: makeInstallationEvent({
        action: "created",
        orgName: account,
        signature: options,
      }),
      webhookSecret: WEBHOOK_SECRET,
    });

    if (!valid) {
      expect(result).toStrictEqual(INVALID_SIGNATURE_RESPONSE);
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
            msg: "Application was installed on an unauthorized account; manual removal is required.",
            httpCode: 200,
            isAuthorized: false,
          },
    );
  });
});

test("authorized organization issue_comment", async () => {
  const result = await authorizer({
    allowedOrgs: ["RAPIDSAI"],
    event: makeIssueCommentEvent({ orgName: "rapidsai" }),
    webhookSecret: WEBHOOK_SECRET,
  });

  expect(result).toStrictEqual({
    msg: "Organization is authorized.",
    httpCode: 200,
    isAuthorized: true,
  });
});

test("unauthorized organization issue_comment is rejected without uninstalling", async () => {
  const result = await authorizer({
    allowedOrgs: ["rapidsai"],
    event: makeIssueCommentEvent({ orgName: "unauthorized_org" }),
    webhookSecret: WEBHOOK_SECRET,
  });

  expect(result).toStrictEqual({
    msg: "Organization is not authorized to use this application.",
    httpCode: 200,
    isAuthorized: false,
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
      webhookSecret: WEBHOOK_SECRET,
    }),
  ).resolves.toStrictEqual(INVALID_SIGNATURE_RESPONSE);
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
    webhookSecret: WEBHOOK_SECRET,
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
    webhookSecret: WEBHOOK_SECRET,
  });

  expect(result).toStrictEqual({
    msg: "Unable to determine organization, no further processing will occur.",
    httpCode: 200,
    isAuthorized: false,
  });
});
