import { NextResponse } from "next/server";


const BACKEND_URL =
 process.env.GAME_SERVER_URL ||
 "https://durak-game-server-wxhe.onrender.com";



export async function proxyGameRequest(
 path:string,
 req:Request
){

 const url =
  `${BACKEND_URL}${path}`;


 console.log(
  "PROXY REQUEST:",
  req.method,
  url
 );


 const headers =
  new Headers();


 headers.set(
  "content-type",
  "application/json"
 );


 const token =
  req.headers.get(
   "x-player-token"
  );


 if(token){

  headers.set(
   "x-player-token",
   token
  );

 }



 const body =
  req.method==="GET"
  ? undefined
  : await req.text();



 const response =
  await fetch(
   url,
   {
    method:req.method,
    headers,
    body,
    cache:"no-store"
   }
  );



 const text =
  await response.text();



 console.log(
  "BACKEND STATUS:",
  response.status,
  text
 );



 return new NextResponse(
  text,
  {
   status:response.status,
   headers:{
    "content-type":
     "application/json"
   }
  }
 );


}
