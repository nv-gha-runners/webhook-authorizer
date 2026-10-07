import { createHmac, timingSafeEqual } from "node:crypto";
import { APIGatewayProxyEvent, LambdaFunctionURLEvent } from "aws-lambda";

type Response = {
  isAuthorized: boolean;
  httpCode: number;
  msg: string;
};

const INVALID_SIGNATURE_RESPONSE: Response = {
  httpCode: 401,
  isAuthorized: false,
  msg: "Webhook signature is missing or invalid.",
};

const logger = (msg: string, obj: Record<string, unknown> = {}) => {
  console.log(JSON.stringify({ "@msg": msg, ...obj }));
};

const getHeader = (
  headers: APIGatewayProxyEvent["headers"],
  name: string,
): string | undefined => {
  const headerName = Object.keys(headers).find(
    (key) => key.toLowerCase() === name.toLowerCase(),
  );
  const value = headerName ? headers[headerName] : undefined;
  return value ?? undefined;
};

const getBody = (
  event: APIGatewayProxyEvent | LambdaFunctionURLEvent,
): Buffer | undefined => {
  if (!event.body) {
    return undefined;
  }

  return Buffer.from(event.body, event.isBase64Encoded ? "base64" : "utf8");
};

const hasValidSignature = (
  body: Buffer,
  signature: string | undefined,
  webhookSecret: string,
): boolean => {
  if (!signature) {
    return false;
  }

  const expected = Buffer.from(
    `sha256=${createHmac("sha256", webhookSecret).update(body).digest("hex")}`,
  );
  const received = Buffer.from(signature);

  return (
    received.length === expected.length && timingSafeEqual(received, expected)
  );
};

/**
 * Given a GitHub webhook and a list of authorized organization names (case
 * insensitive), returns whether the provided webhook is authorized for further
 * processing by a GitHub application. The signature is verified against the
 * raw request body before the payload is parsed or used for authorization.
 * Unauthorized installations are logged for alerting and manual removal; this
 * function does not make destructive GitHub API calls.
 * @param event API Gateway Event containing GitHub webhook
 * @param allowedOrgs Array of authorized organizations
 * @param webhookSecret GitHub App webhook secret
 * @returns Object containing authorization information
 */
export const authorizer = async ({
  event,
  allowedOrgs,
  webhookSecret,
}: {
  event: APIGatewayProxyEvent | LambdaFunctionURLEvent;
  allowedOrgs: string[];
  webhookSecret: string;
}): Promise<Response> => {
  const body = getBody(event);
  const signature = getHeader(event.headers, "X-Hub-Signature-256");

  if (!body || !hasValidSignature(body, signature, webhookSecret)) {
    logger("invalid webhook signature");
    return INVALID_SIGNATURE_RESPONSE;
  }

  const payload = JSON.parse(body.toString("utf8"));
  const ghEvent = getHeader(event.headers, "X-GitHub-Event");
  const lambdaEvent = { "@gh_event": ghEvent, ...payload };
  logger("start", lambdaEvent);

  allowedOrgs = allowedOrgs.map((org) => org.toLowerCase());

  if (ghEvent === "installation" && payload.action === "created") {
    if (
      !allowedOrgs.includes(payload.installation.account.login.toLowerCase())
    ) {
      logger("unauthorized installation created; manual removal required", {
        "@gh_event": ghEvent,
        installationId: payload.installation.id,
        account: payload.installation.account.login,
      });
      return {
        msg: "Application was installed on an unauthorized account; manual removal is required.",
        httpCode: 200,
        isAuthorized: false,
      };
    }
    logger("authorized installation created", lambdaEvent);
    return {
      msg: "New installation from authorized organization.",
      httpCode: 200,
      isAuthorized: true,
    };
  }

  const organizationObj = payload.organization;

  // most (not all) webhook event payloads contain the "organization" object.
  // the ones that don't contain this object (e.g. "sponsorship" events), we
  // generally don't care about. therefore, just send a 200 response for these.
  if (!organizationObj) {
    logger("no org found", lambdaEvent);
    return {
      msg: "Unable to determine organization, no further processing will occur.",
      httpCode: 200,
      isAuthorized: false,
    };
  }

  if (!allowedOrgs.includes(organizationObj.login.toLowerCase())) {
    logger("unauthorized webhook received; manual review required", {
      "@gh_event": ghEvent,
      installationId: payload.installation?.id,
      organization: organizationObj.login,
    });
    return {
      msg: "Organization is not authorized to use this application.",
      httpCode: 200,
      isAuthorized: false,
    };
  }

  logger("webhook authorized", lambdaEvent);
  return {
    msg: "Organization is authorized.",
    httpCode: 200,
    isAuthorized: true,
  };
};
