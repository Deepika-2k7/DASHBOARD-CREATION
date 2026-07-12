import { Box, Card, CardBody, Container, Flex, Heading, Text, VStack } from "@chakra-ui/react";
import { PropsWithChildren } from "react";

export const AuthShell = ({
  title,
  subtitle,
  eyebrow,
  children
}: PropsWithChildren<{ title: string; subtitle: string; eyebrow: string }>) => (
  <Box minH="100vh" bgGradient="linear(to-br, brand.50, lilac.50, mint.50)" position="relative" overflow="hidden">
    <Box
      position="absolute"
      top="-4rem"
      left="-3rem"
      w="22rem"
      h="22rem"
      bg="brand.200"
      opacity={0.35}
      filter="blur(80px)"
      borderRadius="full"
    />
    <Box
      position="absolute"
      right="-4rem"
      bottom="3rem"
      w="20rem"
      h="20rem"
      bg="mint.200"
      opacity={0.35}
      filter="blur(90px)"
      borderRadius="full"
    />

    <Container maxW="6xl" py={{ base: 8, md: 12 }} position="relative">
      <Flex minH="calc(100vh - 96px)" align="center" justify="center" gap={{ base: 8, lg: 14 }} direction={{ base: "column", lg: "row" }}>
        <VStack align="start" spacing={5} flex="1" maxW="lg" px={{ base: 2, md: 0 }}>
          <Text fontSize="sm" fontWeight="800" color="brand.700" letterSpacing="widest">
            {eyebrow}
          </Text>
          <Heading size="2xl" lineHeight="1.05">
            Simple daily work tracking for students and admins
          </Heading>
          <Text color="gray.600" fontSize="lg">
            Sign in once, stay logged in, and jump straight back into your dashboard.
          </Text>
        </VStack>

        <Card w="full" maxW="md" bg="whiteAlpha.920" backdropFilter="blur(14px)" border="1px solid" borderColor="whiteAlpha.700">
          <CardBody p={{ base: 6, md: 8 }}>
            <VStack align="stretch" spacing={5}>
              <Box>
                <Heading size="lg" mb={2}>
                  {title}
                </Heading>
                <Text color="gray.500">{subtitle}</Text>
              </Box>
              {children}
            </VStack>
          </CardBody>
        </Card>
      </Flex>
    </Container>
  </Box>
);
