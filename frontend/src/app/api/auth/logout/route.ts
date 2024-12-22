import authApiRequest from "@/ApiRequests/auth";
import { LoginBodyType } from "@/schemaValidations/auth.schema";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { HttpError } from "@/lib/http";
export async function POST(req: Request) {
  const cookieStore = await cookies();

  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;
  if(!accessToken || !refreshToken) {
    return NextResponse.json({
      error: "Không tìm thấy accessToken hoặc refreshToken",
    }, { status: 401 });
  }

  try {
    const result = await authApiRequest.sLogout({
      accessToken,
      refreshToken,
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({
      error: "Đã xảy ra lỗi khi đăng xuất",
    }, { status: 500 });
  }

}
