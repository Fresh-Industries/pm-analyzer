import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function getServerSession() {
  const hdrs = await headers();
  try {
    return await auth.api.getSession({ headers: hdrs });
  } catch {
    return null;
  }
}
