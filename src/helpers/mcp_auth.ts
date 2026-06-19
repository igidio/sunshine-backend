import type { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol";
import type { user_select } from "~/modules/user/user.schema";
import { check_auth_from_tool } from "~/plugins/auth";

export const require_auth = async (
  extra: RequestHandlerExtra<any, any>,
  options?: {
    allowed_permission?: string;
    allowed_roles?: string[];
  }
) => {
  return check_auth_from_tool({
    user: (extra as any).authInfo as unknown as user_select,
    allowed_permission: options?.allowed_permission as any,
    allowed_roles: options?.allowed_roles as any,
  });
};