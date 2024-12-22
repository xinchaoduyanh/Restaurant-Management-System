import http from "@/lib/http";
import { LoginBodyType, LoginResType, LogoutBodyType } from "@/schemaValidations/auth.schema";



const authApiRequest = {
  sLogin: async(body: LoginBodyType) => http.post<LoginResType>('/auth/login', body),
  login: async(body: LoginBodyType) => http.post<LoginResType>('/api/auth/login', body,{
    baseUrl: '',
  }),
  sLogout: async(body: LogoutBodyType & {accessToken: string}) => http.post('/auth/logout', body, {
    headers: {
      Authorization: `Bearer ${body.accessToken}`,
    },
  }),
  logout: () => http.post('/api/auth/logout', null,{
    baseUrl: '',
  }),
}

export default authApiRequest;
