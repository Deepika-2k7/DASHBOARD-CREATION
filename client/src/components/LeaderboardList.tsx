import { Avatar, Badge, Card, CardBody, Flex, HStack, Text, VStack } from "@chakra-ui/react";

interface LeaderboardEntry {
  studentId: string;
  name: string;
  username: string;
  completedCount: number;
  onTimeCount: number;
  streak: number;
  score: number;
}

const topStyles = [
  { bg: "linear-gradient(135deg, #ffe3a3 0%, #fff2ce 100%)", badge: "1" },
  { bg: "linear-gradient(135deg, #e3ecf7 0%, #f5f7fb 100%)", badge: "2" },
  { bg: "linear-gradient(135deg, #ffd9c7 0%, #fff2ea 100%)", badge: "3" }
];

export const LeaderboardList = ({ entries }: { entries: LeaderboardEntry[] }) => (
  <VStack align="stretch" spacing={4}>
    {entries.map((entry, index) => {
      const topStyle = topStyles[index];

      return (
        <Card key={entry.studentId} bg={topStyle ? topStyle.bg : "whiteAlpha.900"} border="1px solid" borderColor="whiteAlpha.700">
          <CardBody>
            <Flex justify="space-between" align="center" gap={4}>
              <HStack spacing={4}>
                <Text fontSize="2xl" fontWeight="800" minW="32px">
                  {topStyle ? topStyle.badge : `#${index + 1}`}
                </Text>
                <Avatar name={entry.name} bg={index < 3 ? "lilac.400" : "brand.400"} color="white" />
                <VStack align="start" spacing={0}>
                  <Text fontWeight="800">{entry.name}</Text>
                  <Text fontSize="sm" color="gray.500">
                    @{entry.username.toUpperCase()}
                  </Text>
                </VStack>
              </HStack>

              <VStack align="end" spacing={1}>
                <Badge colorScheme="purple" borderRadius="full" px={3} py={1}>
                  {entry.score} pts
                </Badge>
                <Text fontSize="sm" color="gray.600">
                  {entry.completedCount} approved · {entry.onTimeCount} on time · streak {entry.streak}
                </Text>
              </VStack>
            </Flex>
          </CardBody>
        </Card>
      );
    })}
  </VStack>
);
