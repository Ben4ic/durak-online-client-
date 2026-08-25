import { proxyGameRequest } from "@/lib/backendProxy";

export async function GET(req: Request) {
  return proxyGameRequest("/api/online/public", req);
}
