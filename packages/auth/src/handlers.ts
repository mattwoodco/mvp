import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "./auth";

export const authHandlers = toNextJsHandler(auth);
export const { POST, GET } = authHandlers;
