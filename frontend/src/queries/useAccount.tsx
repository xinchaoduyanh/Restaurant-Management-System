import accountApiRequest from "@/ApiRequests/account";
import { useQuery } from "@tanstack/react-query";

export const useAccountQuery = () => {
  return useQuery({
    queryKey: ["account-profile"],
    queryFn: accountApiRequest.me,
  });
};
