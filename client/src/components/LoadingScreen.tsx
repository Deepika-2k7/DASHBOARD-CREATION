import { Center, Spinner, Text, VStack } from "@chakra-ui/react";

export const LoadingScreen = () => (
  <Center minH="100vh">
    <VStack spacing={4}>
      <Spinner size="xl" color="brand.500" thickness="4px" />
      <Text fontWeight="600" color="gray.600">
        Loading your dashboard...
      </Text>
    </VStack>
  </Center>
);

