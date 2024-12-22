import authApiRequest from "@/ApiRequests/auth"
import { LoginBodyType, LogoutBodyType } from "@/schemaValidations/auth.schema"
import { useMutation } from "@tanstack/react-query"



export const useLoginMutation = () => {
  return useMutation({
    mutationFn: authApiRequest.login,
  })
}


export const useLogoutMutation = () => {
  return useMutation({
    mutationFn: authApiRequest.logout,
  })
}
