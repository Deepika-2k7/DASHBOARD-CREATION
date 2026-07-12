import { Badge, HStack, Text } from "@chakra-ui/react";
import { ReactNode } from "react";

export const StatPill = ({
  icon,
  label,
  value,
  colorScheme = "blue"
}: {
  icon: ReactNode;
  label: string;
  value: string;
  colorScheme?: string;
}) => (
  <HStack
    bg="white"
    borderRadius="full"
    px={4}
    py={3}
    spacing={3}
    boxShadow="0 10px 24px rgba(34, 63, 116, 0.08)"
  >
    <Badge colorScheme={colorScheme} px={2.5} py={1} borderRadius="full">
      {icon}
    </Badge>
    <Text fontSize="sm" color="gray.500">
      {label}
    </Text>
    <Text fontWeight="700">{value}</Text>
  </HStack>
);

