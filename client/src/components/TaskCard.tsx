import { CheckIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import { Badge, Box, Button, Card, CardBody, Flex, Heading, SimpleGrid, Text, VStack } from "@chakra-ui/react";

export interface TaskCardData {
  _id: string;
  title: string;
  description: string;
  date: string;
  deadline: string;
  type?: "daily" | "monthly";
  completionStatus?: "pending" | "completed";
  completedAt?: string | null;
  completedCount?: number;
  completedStudents?: string[];
  isOpen?: boolean;
  friendlyLockMessage?: string | null;
}

export const TaskCard = ({
  task,
  onSubmitClick,
  onCompleteClick,
  compact = false
}: {
  task: TaskCardData;
  onSubmitClick?: (task: TaskCardData) => void;
  onCompleteClick?: (task: TaskCardData) => void;
  compact?: boolean;
}) => {
  const isCompleted = task.completionStatus === "completed";
  const isLocked = task.isOpen === false && !isCompleted;

  return (
    <Card
      bg={isCompleted ? "linear-gradient(135deg, #f1fff7 0%, #ffffff 100%)" : "whiteAlpha.950"}
      overflow="hidden"
      borderWidth="1px"
      borderColor={isCompleted ? "green.100" : "whiteAlpha.700"}
      boxShadow={isCompleted ? "0 20px 48px rgba(60, 190, 131, 0.16)" : undefined}
    >
      <Box h="12px" bgGradient={isCompleted ? "linear(to-r, green.300, mint.400)" : "linear(to-r, brand.300, lilac.400, mint.300)"} />
      <CardBody p={{ base: 5, md: 6 }}>
        <VStack align="stretch" spacing={4}>
          <Flex direction={{ base: "column", sm: "row" }} justify="space-between" align={{ base: "start", sm: "start" }} gap={3}>
            <VStack align="start" spacing={1} minW={0} flex="1">
              <Heading size="md" wordBreak="break-word">
                {task.title}
              </Heading>
              {!compact ? (
                <Text color="gray.500" fontSize="sm" wordBreak="break-word">
                  {task.type === "monthly" ? "Monthly task" : "Daily task"} · due {new Date(task.deadline).toLocaleString()}
                </Text>
              ) : null}
            </VStack>
            <Badge colorScheme={isCompleted ? "green" : isLocked ? "gray" : "blue"} px={3} py={1.5} borderRadius="full" flexShrink={0}>
              {isCompleted ? "Completed" : isLocked ? "Closed" : "Open"}
            </Badge>
          </Flex>

          {!compact ? <Text color="gray.700" wordBreak="break-word">{task.description}</Text> : null}

          {!compact ? (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
              <Box p={3} borderRadius="xl" bg={isCompleted ? "green.50" : "gray.50"}>
                <Text fontSize="xs" textTransform="uppercase" letterSpacing="widest" color="gray.500" mb={1}>
                  Task Date
                </Text>
                <Text fontWeight="700">{new Date(task.date).toLocaleDateString()}</Text>
              </Box>
              <Box p={3} borderRadius="xl" bg={isCompleted ? "green.50" : "gray.50"}>
                <Text fontSize="xs" textTransform="uppercase" letterSpacing="widest" color="gray.500" mb={1}>
                  Status
                </Text>
                <Text fontWeight="700">{isCompleted ? "Completed" : isLocked ? "Closed" : "Open"}</Text>
              </Box>
            </SimpleGrid>
          ) : null}

          {onSubmitClick ? (
            <Button
              colorScheme="linkedin"
              size="lg"
              leftIcon={<ExternalLinkIcon />}
              onClick={() => onSubmitClick(task)}
              w={{ base: "full", sm: "auto" }}
            >
              Open
            </Button>
          ) : null}

          {onCompleteClick ? (
            <Button
              colorScheme="green"
              size="lg"
              leftIcon={<CheckIcon />}
              onClick={() => onCompleteClick(task)}
              isDisabled={isCompleted}
              w={{ base: "full", sm: "auto" }}
            >
              Completed
            </Button>
          ) : null}

          {isLocked && task.friendlyLockMessage ? <Text fontSize="sm" color="gray.500">{task.friendlyLockMessage}</Text> : null}
        </VStack>
      </CardBody>
    </Card>
  );
};
