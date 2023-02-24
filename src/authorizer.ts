import { APIGatewayProxyEvent } from "aws-lambda";
import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "@octokit/rest";

type Response = {
  isAuthorized: boolean;
  httpCode: number;
  msg: string;
};

const UNINSTALL_FAILED_RESPONSE: Response = {
  httpCode: 500,
  isAuthorized: false,
  msg: "Unauthorized organization detected. Automatic uninstall failed.",
};

const logger = (msg: string, obj: any = {}) => {
  console.log(JSON.stringify({ "@msg": msg, ...obj }));
};

const deleteInstallation = async (payload: any) => {
  const installationId = payload.installation.id;
  const privateKey = process.env.PRIVATE_KEY;

  if (!privateKey) {
    logger("no private key");
    throw new Error("No private key found in environment");
  }

  const octokit = new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: payload.installation.app_id,
      privateKey: Buffer.from(privateKey, "base64").toString(),
      installationId,
    },
  });

  return octokit.rest.apps.deleteInstallation({
    installation_id: installationId,
  });
};

/**
 * Given a GitHub webhook and a list of authorized organization names (case
 * insensitive), returns whether the provided webhook is authorized for further
 * processing by a GitHub application. If the webhook originates from an
 * organization that is not authorized to use the application it will be
 * uninstalled from that organization.
 * @param event API Gateway Event containing GitHub webhook
 * @param allowedOrgs Array of authorized organizations
 * @returns Object containing authorization information
 */
export const authorizer = async ({
  event,
  allowedOrgs,
}: {
  event: APIGatewayProxyEvent;
  allowedOrgs: string[];
}): Promise<Response> => {
  const payload = JSON.parse(event.body as string);
  const ghEvent = event.headers["X-GitHub-Event"] as string;
  const lambdaEvent = { "@gh_event": ghEvent, ...payload };
  logger("start", lambdaEvent);

  allowedOrgs = allowedOrgs.map((org) => org.toLowerCase());

  if (ghEvent === "installation" && payload.action === "created") {
    if (
      !allowedOrgs.includes(payload.installation.account.login.toLowerCase())
    ) {
      logger("unauthorized installation created", lambdaEvent);
      try {
        await deleteInstallation(payload);
        return {
          msg: "Application was automatically uninstalled from an unauthorized account.",
          httpCode: 200,
          isAuthorized: false,
        };
      } catch (error) {
        console.error(error);
        return UNINSTALL_FAILED_RESPONSE;
      }
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
    logger("unauthorized webhook received", lambdaEvent);

    try {
      await deleteInstallation(payload);
      return {
        msg: "Organization is not authorized to use this application. Installation deleted.",
        httpCode: 200,
        isAuthorized: false,
      };
    } catch (error) {
      console.error(error);
      return UNINSTALL_FAILED_RESPONSE;
    }
  }

  logger("webhook authorized", lambdaEvent);
  return {
    msg: "Organization is authorized.",
    httpCode: 200,
    isAuthorized: true,
  };
};
