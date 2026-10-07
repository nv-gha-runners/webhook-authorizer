import { APIGatewayProxyEvent } from "aws-lambda";
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
    headers: {
      "X-GitHub-Event": event,
      ...(webhookSignature === null
        ? {}
        : { "X-Hub-Signature-256": webhookSignature }),
    },
    body,
    isBase64Encoded: false,
  } as unknown as APIGatewayProxyEvent;
};
