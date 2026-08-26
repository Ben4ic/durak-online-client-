import { proxyGameRequest } from "@/lib/backendProxy";


export async function GET(req: Request) {


  const url = new URL(req.url);


  const code =
    url.searchParams.get("code") ||
    url.searchParams.get("room");



  return proxyGameRequest(
    `/api/online/room?code=${code}`,
    req
  );


}
