import { useAuthContext } from "@/providers/AuthProvider";

const useUser = () => {
  const context = useAuthContext();

  return {
    user: context.user,
    data: context.user,
    loading: context.userLoading,
    refetch: context.refetchUser,
    isAuthenticated: !!context.user
  };
};

export { useUser };
export default useUser;