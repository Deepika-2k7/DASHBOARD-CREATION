import { useToast } from "@chakra-ui/react";

export const useToastMessage = () => {
  const toast = useToast();

  return {
    success: (title: string, description?: string) =>
      toast({
        title,
        description,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right"
      }),
    error: (title: string, description?: string) =>
      toast({
        title,
        description,
        status: "error",
        duration: 3500,
        isClosable: true,
        position: "top-right"
      })
  };
};

