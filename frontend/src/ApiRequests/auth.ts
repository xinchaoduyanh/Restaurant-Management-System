import http from "@/lib/http";
import { LoginBodyType, LoginResType } from "@/schemaValidations/auth.schema";



const authApiRequest = {
  sLogin: async(body: LoginBodyType) => http.post<LoginResType>('/auth/login', body),
  Login: async(body: LoginBodyType) => http.post('/api/auth/login', body,{
    baseUrl: '',
  }),
}

export default authApiRequest;
