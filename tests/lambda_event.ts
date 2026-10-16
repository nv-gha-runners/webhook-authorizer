import { LambdaFunctionURLEvent } from "aws-lambda";
import { createHmac } from "node:crypto";

export const WEBHOOK_SECRET = "test-webhook-secret";

export type WebhookSignatureOptions = {
  secret?: string;
  signature?: string | null;
};

export const makeLambdaEvent = (
  event: string,
  payload: any,
  { secret = WEBHOOK_SECRET, signature }: WebhookSignatureOptions = {},
) => {
  const body = JSON.stringify(payload);
  const webhookSignature =
    signature === undefined
      ? `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`
      : signature;

  return {
    version: "2.0",
    routeKey: "$default",
    rawPath: "/",
    rawQueryString: "",
    headers: {
      "content-type": "application/json",
      "x-github-event": event,
      ...(webhookSignature === null
        ? {}
        : { "x-hub-signature-256": webhookSignature }),
    },
    requestContext: {
      accountId: "anonymous",
      apiId: "example",
      domainName: "example.lambda-url.us-east-2.on.aws",
      domainPrefix: "example",
      http: {
        method: "POST",
        path: "/",
        protocol: "HTTP/1.1",
        sourceIp: "192.0.2.1",
        userAgent: "GitHub-Hookshot/example",
      },
      requestId: "example-request-id",
      routeKey: "$default",
      stage: "$default",
      time: "16/Oct/2026:17:00:00 +0000",
      timeEpoch: 1792170000000,
    },
    body,
    isBase64Encoded: false,
  } as LambdaFunctionURLEvent;
};
