import authApiRequest from "@/ApiRequests/auth";
import { LoginBodyType } from "@/schemaValidations/auth.schema";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { HttpError } from "@/lib/http";
export async function POST(req: Request) {
  const body = (await req.json()) as LoginBodyType;
  const cookieStore = cookies();
  try {
    const { payload } = await authApiRequest.sLogin(body);
    const { accessToken, refreshToken } = payload.data;
    const decodedAccessToken = jwt.decode(accessToken) as { exp: number };
    const decodedRefreshToken = jwt.decode(refreshToken) as { exp: number };
    const accessTokenExp = new Date(decodedAccessToken.exp * 1000);
    const refreshTokenExp = new Date(decodedRefreshToken.exp * 1000);
    const currentTime = new Date();
    cookieStore.set("accessToken", accessToken, {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      expires: refreshTokenExp,
    });
    return NextResponse.json(payload);
  } catch (error) {
    if(error instanceof HttpError) {
      return NextResponse.json({error: error.payload}, {status: error.status})
    }
    else {
      return NextResponse.json({error: "Internal server error"}, {status: 500})
    } 
  }
}
