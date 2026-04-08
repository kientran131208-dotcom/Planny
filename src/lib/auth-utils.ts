import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

/**
 * Gets the current user ID from the session.
 * Throws an error if not authenticated.
 */
export async function getUserId() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    console.error("[AUTH] getUserId: No authorized session found");
    throw new Error("Unauthorized: No session found");
  }
  
  // Log user ID in development for debugging
  if (process.env.NODE_ENV === "development") {
    console.log(`[AUTH] Fetching data for user ID: ${session.user.id} (${session.user.email})`);
  }
  
  return session.user.id;
}

/**
 * Gets the current session with typed user.
 */
export async function getAuthSession() {
  return await getServerSession(authOptions);
}
