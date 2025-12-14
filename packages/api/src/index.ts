import { ORPCError, os } from "@orpc/server";
import type { Context } from "./context";

export const o = os.$context<Context>();

export const publicProcedure = o;

const requireAuth = o.middleware(async ({ context, next }) => {
  if (!context.session?.user) {
    throw new ORPCError("UNAUTHORIZED");
  }
  return next({
    context: {
      session: context.session,
    },
  });
});

export const protectedProcedure = publicProcedure.use(requireAuth);

const requireDeviceAuth = o.middleware(async ({ context, next }) => {
  const authHeaderKey =
    process.env.DEVICE_AUTH_HEADER_KEY || "X-DEVICE-API-KEY";
  const apiKey = process.env.DEVICE_API_KEY;

  if (!apiKey) {
    throw new ORPCError("INTERNAL_SERVER_ERROR", {
      message: "Device API key not configured",
    });
  }

  const providedKey = context.req.headers.get(authHeaderKey);

  if (!providedKey || providedKey !== apiKey) {
    throw new ORPCError("UNAUTHORIZED", {
      message: "Invalid device API key",
    });
  }

  return next({
    context: {
      ...context,
      isDevice: true,
    },
  });
});

export const deviceProcedure = publicProcedure.use(requireDeviceAuth);
