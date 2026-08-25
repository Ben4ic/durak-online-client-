import { proxyGameRequest } from "@/lib/backendProxy";

export async function POST(req: Request) {
  return proxyGameRequest("/api/online/join", req);
}
