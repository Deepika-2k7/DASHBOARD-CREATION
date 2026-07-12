import { Badge, Box, Button, Card, CardBody, HStack, Heading, Progress, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";

export interface TaskCardData {
  _id: string;
  title: string;
  description: string;
  date: string;
  deadline: string;
  type?: "daily" | "monthly";
  isSubmitted?: boolean;
  submissionStatus?: string;
  isOpen?: boolean;
  friendlyLockMessage?: string | null;
}

export const TaskCard = ({
  task,
  onSubmitClick
}: {
  task: TaskCardData;
  onSubmitClick?: (task: TaskCardData) => void;
}) => {
  const isCompleted = Boolean(task.isSubmitted);
  const isLocked = task.isOpen === false && !isCompleted;
  const isApproved = task.submissionStatus === "approved";
  const isPending = isCompleted && !isApproved;
  const progressValue = isApproved ? 100 : 0;
  const accentGradient = isApproved
    ? "linear(to-r, green.300, mint.400)"
    : isPending
      ? "linear(to-r, purple.300, brand.300)"
      : isLocked
        ? "linear(to-r, gray.300, gray.400)"
        : "linear(to-r, brand.300, lilac.400, mint.300)";

  const statusLabel = isApproved
    ? "Completed"
    : isPending
      ? "Pending Review"
      : isLocked
        ? "Closed"
        : "Open";

  const openButtonIcon = !isCompleted && !isLocked ? <ExternalLinkIcon /> : undefined;

  return (
    <Card
      bg={isApproved ? "linear-gradient(135deg, #f1fff7 0%, #ffffff 100%)" : "whiteAlpha.950"}
      overflow="hidden"
      borderWidth="1px"
      borderColor={isApproved ? "green.100" : "whiteAlpha.700"}
      boxShadow={isApproved ? "0 20px 48px rgba(60, 190, 131, 0.16)" : undefined}
    >
      <Box h="12px" bgGradient={accentGradient} />
      <CardBody p={{ base: 5, md: 6 }}>
        <VStack align="stretch" spacing={4}>
          <HStack justify="space-between" align="start" spacing={4}>
            <VStack align="start" spacing={1}>
              <Heading size="md">{task.title}</Heading>
              <Text color="gray.500" fontSize="sm">
                {task.type === "monthly" ? "Monthly task" : "Daily task"} · due {new Date(task.deadline).toLocaleString()}
              </Text>
            </VStack>
            <Badge colorScheme={isApproved ? "green" : isCompleted ? "purple" : isLocked ? "gray" : "blue"} px={3} py={1.5} borderRadius="full">
              {statusLabel}
            </Badge>
          </HStack>

          <Text color="gray.700">{task.description}</Text>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
            <Box p={3} borderRadius="xl" bg={isApproved ? "green.50" : "gray.50"}>
              <Text fontSize="xs" textTransform="uppercase" letterSpacing="widest" color="gray.500" mb={1}>
                Task Date
              </Text>
              <Text fontWeight="700">{new Date(task.date).toLocaleDateString()}</Text>
            </Box>
            <Box p={3} borderRadius="xl" bg={isApproved ? "green.50" : "gray.50"}>
              <Text fontSize="xs" textTransform="uppercase" letterSpacing="widest" color="gray.500" mb={1}>
                Review State
              </Text>
              <Text fontWeight="700">{statusLabel}</Text>
            </Box>
          </SimpleGrid>

          <Box>
            <HStack justify="space-between" mb={2}>
              <Text fontSize="sm" color="gray.500">
                Progress
              </Text>
              <Text fontSize="sm" fontWeight="700" color={isApproved ? "green.600" : "gray.700"}>
                {progressValue}%
              </Text>
            </HStack>
            <Progress value={progressValue} colorScheme={isApproved ? "green" : isCompleted ? "purple" : isLocked ? "gray" : "linkedin"} borderRadius="full" h="11px" />
          </Box>

          {onSubmitClick ? (
            <Button
              colorScheme={isApproved ? "green" : "linkedin"}
              size="lg"
              leftIcon={openButtonIcon}
              onClick={() => onSubmitClick(task)}
              isDisabled={isCompleted || isLocked}
            >
              {isApproved ? "Approved" : isCompleted ? "Awaiting Approval" : "Open Task"}
            </Button>
          ) : null}

          {isLocked ? (
            <Text fontSize="sm" color="gray.500">
              {task.friendlyLockMessage}
            </Text>
          ) : null}
        </VStack>
      </CardBody>
    </Card>
  );
};
