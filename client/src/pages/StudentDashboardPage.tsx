import {
  Box,
  Button,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Progress,
  SimpleGrid,
  Text,
  Textarea,
  VStack,
  useDisclosure
} from "@chakra-ui/react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import { LeaderboardList } from "../components/LeaderboardList";
import { Shell } from "../components/Shell";
import { TaskCard, TaskCardData } from "../components/TaskCard";
import { useAuth } from "../contexts/AuthContext";
import { useToastMessage } from "../hooks/useToastMessage";

interface LeaderboardEntry {
  studentId: string;
  name: string;
  username: string;
  completedCount: number;
  onTimeCount: number;
  streak: number;
  score: number;
}

interface Announcement {
  _id: string;
  title: string;
  message: string;
  replies: { username: string; message: string; createdAt: string }[];
  createdAt: string;
}

interface LeaveRequestItem {
  _id: string;
  date: string;
  reason: string;
  type: "leave" | "od";
  status: "pending" | "approved" | "rejected";
}

interface ResourceItem {
  _id: string;
  title: string;
  fileUrl: string;
  resourceType: "pdf" | "link";
}

interface PollItem {
  _id: string;
  question: string;
  options: { text: string; votes: number }[];
  responses: { studentId: string; optionIndex: number }[];
}

interface ScheduleItem {
  weeklyData: { day: string; slots: string[] }[];
}

const MENU_ITEMS = [
  { key: "progress", label: "Progress" },
  { key: "daily", label: "My Tasks" },
  { key: "monthly", label: "Monthly Tasks" },
  { key: "leaderboard", label: "Leaderboard" },
  { key: "profile", label: "My Profile" },
  { key: "announcements", label: "Announcements" },
  { key: "polls", label: "Polls" },
  { key: "leave", label: "Leave / OD Request" },
  { key: "schedule", label: "Schedule" },
  { key: "resources", label: "Resources" }
];

const medalForRank = (rank: number) => {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return "🏅";
};

export const StudentDashboardPage = () => {
  const { user, updateProfile } = useAuth();
  const toast = useToastMessage();
  const taskModal = useDisclosure();
  const [activeSection, setActiveSection] = useState("progress");
  const [tasks, setTasks] = useState<TaskCardData[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequestItem[]>([]);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [polls, setPolls] = useState<PollItem[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem>({ weeklyData: [] });
  const [selectedTask, setSelectedTask] = useState<TaskCardData | null>(null);
  const [submissionLink, setSubmissionLink] = useState("");
  const [submissionMessage, setSubmissionMessage] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [leaveDate, setLeaveDate] = useState("");
  const [leaveReason, setLeaveReason] = useState("");
  const [leaveType, setLeaveType] = useState<"leave" | "od">("leave");
  const [profileName, setProfileName] = useState("");
  const [profileRegisterNumber, setProfileRegisterNumber] = useState("");
  const [profilePassword, setProfilePassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [submittingTask, setSubmittingTask] = useState(false);
  const [submittingLeave, setSubmittingLeave] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [
        tasksResponse,
        leaderboardResponse,
        announcementsResponse,
        leaveResponse,
        resourcesResponse,
        pollsResponse,
        scheduleResponse
      ] = await Promise.all([
        api.get("/tasks"),
        api.get("/leaderboard"),
        api.get("/announcements"),
        api.get("/leave-requests"),
        api.get("/resources"),
        api.get("/polls"),
        api.get("/schedule")
      ]);

      setTasks(tasksResponse.data);
      setLeaderboard(leaderboardResponse.data);
      setAnnouncements(announcementsResponse.data);
      setLeaveRequests(leaveResponse.data);
      setResources(resourcesResponse.data);
      setPolls(pollsResponse.data);
      setSchedule(scheduleResponse.data);
    } catch (error: any) {
      toast.error("Couldn't load dashboard", error.response?.data?.message || "Please refresh and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    setProfileName(user?.name || "");
    setProfileRegisterNumber(user?.registerNumber || "");
  }, [user?.name, user?.registerNumber]);

  const dailyTasks = useMemo(() => tasks.filter((task) => task.type !== "monthly"), [tasks]);
  const monthlyTasks = useMemo(() => tasks.filter((task) => task.type === "monthly"), [tasks]);
  const me = useMemo(() => leaderboard.find((entry) => entry.username === user?.username), [leaderboard, user?.username]);
  const rank = useMemo(() => Math.max(leaderboard.findIndex((entry) => entry.username === user?.username) + 1, 1), [leaderboard, user?.username]);
  const completedTasks = tasks.filter((task) => task.submissionStatus === "approved").length;
  const taskProgress = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0;
  const pendingTasks = tasks.filter((task) => !task.isSubmitted).length;
  const totalXp = me?.score || 0;
  const streak = me?.streak || 0;

  const openTaskModal = (task: TaskCardData) => {
    setSelectedTask(task);
    setSubmissionLink("");
    setSubmissionMessage("");
    setFileUrl("");
    taskModal.onOpen();
  };

  const handleTaskSubmit = async () => {
    if (!selectedTask) {
      return;
    }

    setSubmittingTask(true);
    try {
      await api.post("/submissions", {
        taskId: selectedTask._id,
        link: submissionLink,
        message: submissionMessage,
        fileUrl
      });
      toast.success("Task submitted", "Your work is now pending admin approval.");
      taskModal.onClose();
      await loadData();
    } catch (error: any) {
      toast.error("Couldn't submit task", error.response?.data?.message || "Please try again.");
    } finally {
      setSubmittingTask(false);
    }
  };

  const handleLeaveSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmittingLeave(true);

    try {
      await api.post("/leave-requests", {
        date: leaveDate,
        reason: leaveReason,
        type: leaveType
      });
      toast.success("Request sent", "Your request is waiting for approval.");
      setLeaveDate("");
      setLeaveReason("");
      setLeaveType("leave");
      await loadData();
    } catch (error: any) {
      toast.error("Couldn't submit request", error.response?.data?.message || "Please try again.");
    } finally {
      setSubmittingLeave(false);
    }
  };

  const handleReplySubmit = async (announcementId: string) => {
    const message = replyDrafts[announcementId];
    if (!message?.trim()) {
      return;
    }

    try {
      await api.post(`/announcements/${announcementId}/replies`, { message });
      setReplyDrafts((prev) => ({ ...prev, [announcementId]: "" }));
      await loadData();
    } catch (error: any) {
      toast.error("Couldn't add reply", error.response?.data?.message || "Please try again.");
    }
  };

  const handlePollVote = async (pollId: string, optionIndex: number) => {
    try {
      await api.post(`/polls/${pollId}/respond`, { optionIndex });
      toast.success("Vote submitted", "Thanks for sharing your response.");
      await loadData();
    } catch (error: any) {
      toast.error("Couldn't submit vote", error.response?.data?.message || "Please try again.");
    }
  };

  const handleProfileSave = async (event: FormEvent) => {
    event.preventDefault();
    setSavingProfile(true);

    try {
      await updateProfile({
        name: profileName,
        registerNumber: profileRegisterNumber,
        password: profilePassword || undefined
      });
      setProfilePassword("");
      toast.success("Profile updated", "Your account details were saved.");
    } catch (error: any) {
      toast.error("Couldn't update profile", error.response?.data?.message || "Please try again.");
    } finally {
      setSavingProfile(false);
    }
  };

  const renderTaskSection = (items: TaskCardData[], label: string) => (
    <VStack align="stretch" spacing={4}>
      <Heading size="md">{label}</Heading>
      <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={4}>
        {items.map((task) => (
          <TaskCard key={task._id} task={task} onSubmitClick={openTaskModal} />
        ))}
      </SimpleGrid>
      {!items.length ? (
        <Card>
          <CardBody>
            <Text color="gray.500">No tasks available here right now.</Text>
          </CardBody>
        </Card>
      ) : null}
    </VStack>
  );

  const renderSection = () => {
    switch (activeSection) {
      case "daily":
        return renderTaskSection(dailyTasks, "Daily tasks");
      case "monthly":
        return renderTaskSection(monthlyTasks, "Monthly tasks");
      case "leaderboard":
        return (
          <Card>
            <CardBody>
              <Heading size="md" mb={4}>
                Leaderboard
              </Heading>
              <LeaderboardList entries={leaderboard} />
            </CardBody>
          </Card>
        );
      case "profile":
        return (
          <Card>
            <CardBody>
              <VStack as="form" align="stretch" spacing={4} onSubmit={handleProfileSave}>
                <Heading size="md">Edit profile</Heading>
                <FormControl>
                  <FormLabel>Name</FormLabel>
                  <Input value={profileName} onChange={(e) => setProfileName(e.target.value)} />
                </FormControl>
                <FormControl>
                  <FormLabel>Register Number</FormLabel>
                  <Input value={profileRegisterNumber} onChange={(e) => setProfileRegisterNumber(e.target.value)} />
                </FormControl>
                <FormControl>
                  <FormLabel>New Password</FormLabel>
                  <Input type="password" value={profilePassword} onChange={(e) => setProfilePassword(e.target.value)} placeholder="Optional" />
                </FormControl>
                <Button type="submit" colorScheme="purple" isLoading={savingProfile}>
                  Save Profile
                </Button>
              </VStack>
            </CardBody>
          </Card>
        );
      case "announcements":
        return (
          <VStack align="stretch" spacing={4}>
            {announcements.map((announcement) => (
              <Card key={announcement._id}>
                <CardBody>
                  <Heading size="sm">{announcement.title}</Heading>
                  <Text color="gray.600" mt={2}>
                    {announcement.message}
                  </Text>
                  <Text fontSize="sm" color="gray.500" mt={2}>
                    {new Date(announcement.createdAt).toLocaleString()}
                  </Text>

                  <VStack align="stretch" spacing={3} mt={4}>
                    {announcement.replies.map((reply, index) => (
                      <Box key={`${announcement._id}-${index}`} p={3} borderRadius="xl" bg="gray.50">
                        <Text fontWeight="700">@{reply.username.toUpperCase()}</Text>
                        <Text color="gray.600">{reply.message}</Text>
                      </Box>
                    ))}
                  </VStack>

                  <HStack mt={4} align="start">
                    <Textarea
                      value={replyDrafts[announcement._id] || ""}
                      onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [announcement._id]: e.target.value }))}
                      placeholder="Reply to this announcement"
                    />
                    <Button colorScheme="purple" onClick={() => handleReplySubmit(announcement._id)}>
                      Reply
                    </Button>
                  </HStack>
                </CardBody>
              </Card>
            ))}
          </VStack>
        );
      case "polls":
        return (
          <VStack align="stretch" spacing={4}>
            {polls.map((poll) => {
              const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);
              const hasVoted = poll.responses.some((response) => response.studentId === user?.id);

              return (
                <Card key={poll._id}>
                  <CardBody>
                    <Heading size="sm" mb={4}>
                      {poll.question}
                    </Heading>
                    <VStack align="stretch" spacing={3}>
                      {poll.options.map((option, index) => {
                        const percentage = totalVotes ? Math.round((option.votes / totalVotes) * 100) : 0;
                        const selectedIndex = poll.responses.find((response) => String(response.studentId) === String(user?.id))?.optionIndex;
                        const isSelected = selectedIndex === index;
                        return (
                          <Box
                            key={`${poll._id}-${index}`}
                            p={4}
                            borderRadius="xl"
                            bg={isSelected ? "blue.50" : "gray.50"}
                            borderWidth="1px"
                            borderColor={isSelected ? "blue.300" : "transparent"}
                          >
                            <HStack justify="space-between" mb={2}>
                              <Text fontWeight={isSelected ? "700" : "500"} color={isSelected ? "blue.700" : "gray.700"}>
                                {option.text}
                              </Text>
                              <Text fontSize="sm" color="gray.500">
                                {percentage}%
                              </Text>
                            </HStack>
                            <Progress
                              value={percentage}
                              colorScheme={isSelected ? "blue" : "linkedin"}
                              borderRadius="full"
                            />
                            {!hasVoted ? (
                              <Button mt={2} size="sm" variant="outline" onClick={() => handlePollVote(poll._id, index)}>
                                Vote
                              </Button>
                            ) : (
                              isSelected ? (
                                <Text mt={2} fontSize="sm" color="blue.600">
                                  You voted for this option.
                                </Text>
                              ) : null
                            )}
                          </Box>
                        );
                      })}
                    </VStack>
                  </CardBody>
                </Card>
              );
            })}
          </VStack>
        );
      case "leave":
        return (
          <Grid templateColumns={{ base: "1fr", xl: "1fr 1fr" }} gap={6}>
            <GridItem>
              <Card>
                <CardBody>
                  <VStack as="form" align="stretch" spacing={4} onSubmit={handleLeaveSubmit}>
                    <Heading size="md">Leave / OD request</Heading>
                    <FormControl>
                      <FormLabel>Date</FormLabel>
                      <Input type="date" value={leaveDate} onChange={(e) => setLeaveDate(e.target.value)} />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Reason</FormLabel>
                      <Textarea value={leaveReason} onChange={(e) => setLeaveReason(e.target.value)} />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Type</FormLabel>
                      <Input value={leaveType.toUpperCase()} readOnly />
                    </FormControl>
                    <HStack>
                      <Button variant={leaveType === "leave" ? "solid" : "outline"} onClick={() => setLeaveType("leave")}>
                        Leave
                      </Button>
                      <Button variant={leaveType === "od" ? "solid" : "outline"} onClick={() => setLeaveType("od")}>
                        OD
                      </Button>
                    </HStack>
                    <Button type="submit" colorScheme="purple" isLoading={submittingLeave}>
                      Submit Request
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            </GridItem>
            <GridItem>
              <Card>
                <CardBody>
                  <Heading size="md" mb={4}>
                    My requests
                  </Heading>
                  <VStack align="stretch" spacing={3}>
                    {leaveRequests.map((request) => (
                      <Box key={request._id} p={4} borderRadius="xl" bg="gray.50">
                        <Text fontWeight="700">
                          {request.type.toUpperCase()} · {new Date(request.date).toLocaleDateString()}
                        </Text>
                        <Text color="gray.600" mt={2}>
                          {request.reason}
                        </Text>
                        <Text fontSize="sm" color="gray.500" mt={2}>
                          Status: {request.status}
                        </Text>
                      </Box>
                    ))}
                  </VStack>
                </CardBody>
              </Card>
            </GridItem>
          </Grid>
        );
      case "schedule":
        return (
          <Card>
            <CardBody>
              <Heading size="md" mb={4}>
                Weekly timetable
              </Heading>
              <VStack align="stretch" spacing={3}>
                {schedule.weeklyData.map((item) => (
                  <Box key={item.day} p={4} borderRadius="xl" bg="gray.50">
                    <Text fontWeight="700">{item.day}</Text>
                    <Text color="gray.600">{item.slots.join(" · ")}</Text>
                  </Box>
                ))}
              </VStack>
            </CardBody>
          </Card>
        );
      case "resources":
        return (
          <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={4}>
            {resources.map((resource) => (
              <Card key={resource._id}>
                <CardBody>
                  <Heading size="sm">{resource.title}</Heading>
                  <Text color="gray.500" mt={2}>
                    {resource.resourceType}
                  </Text>
                  <Button
                    as="a"
                    href={resource.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    colorScheme="linkedin"
                    mt={4}
                  >
                    {resource.resourceType === "pdf" ? "Open PDF" : "Visit Resource"}
                  </Button>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        );
      case "progress":
      default:
        return (
          <VStack align="stretch" spacing={6}>
            <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={4}>
              <Card>
                <CardBody>
                  <Text fontSize="sm" color="gray.500">
                    Total XP
                  </Text>
                  <Heading size="lg" mt={1}>
                    {totalXp}
                  </Heading>
                  <Text color="gray.600" mt={2}>
                    Great progress! 🚀
                  </Text>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <Text fontSize="sm" color="gray.500">
                    Daily Streak 🔥
                  </Text>
                  <Heading size="lg" mt={1}>
                    {streak}
                  </Heading>
                  <Text color="gray.600" mt={2}>
                    Keep the fire alive 🔥
                  </Text>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <Text fontSize="sm" color="gray.500">
                    Rank 🏅
                  </Text>
                  <Heading size="lg" mt={1}>
                    #{rank} {medalForRank(rank)}
                  </Heading>
                  <Text color="gray.600" mt={2}>
                    Climbing higher! 💪
                  </Text>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <Text fontSize="sm" color="gray.500">
                    Task completion
                  </Text>
                  <Heading size="lg" mt={1}>
                    {taskProgress}%
                  </Heading>
                  <Text color="gray.600" mt={2}>
                    {completedTasks} of {tasks.length} approved
                  </Text>
                </CardBody>
              </Card>
            </SimpleGrid>

            <Grid templateColumns={{ base: "1fr", xl: "1.4fr 1fr" }} gap={6}>
              <GridItem>
                <VStack align="stretch" spacing={4}>
                  <Heading size="md">My tasks</Heading>
                  <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={4}>
                    {dailyTasks.slice(0, 2).map((task) => (
                      <TaskCard key={task._id} task={task} onSubmitClick={openTaskModal} />
                    ))}
                  </SimpleGrid>
                </VStack>
              </GridItem>
              <GridItem>
                <Card>
                  <CardBody>
                    <Heading size="md" mb={4}>
                      Top performers
                    </Heading>
                    <LeaderboardList entries={leaderboard.slice(0, 5)} />
                  </CardBody>
                </Card>
              </GridItem>
            </Grid>
          </VStack>
        );
    }
  };

  return (
    <Shell menuItems={MENU_ITEMS} activeKey={activeSection} onSelect={setActiveSection} title="Student Dashboard" subtitle="student">
      {loading ? <Text color="gray.500">Loading your dashboard...</Text> : renderSection()}

      <Modal isOpen={taskModal.isOpen} onClose={taskModal.onClose} isCentered>
        <ModalOverlay backdropFilter="blur(6px)" />
        <ModalContent borderRadius="3xl">
          <ModalHeader>{selectedTask?.title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack align="stretch" spacing={4}>
              <FormControl>
                <FormLabel>Link / URL</FormLabel>
                <Input value={submissionLink} onChange={(e) => setSubmissionLink(e.target.value)} placeholder="https://..." />
              </FormControl>
              <FormControl>
                <FormLabel>Message to Admin</FormLabel>
                <Textarea value={submissionMessage} onChange={(e) => setSubmissionMessage(e.target.value)} placeholder="Share your update or note..." />
              </FormControl>
              <FormControl>
                <FormLabel>File upload</FormLabel>
                <Input type="file" p={1} onChange={(e) => setFileUrl(e.target.files?.[0]?.name || "")} />
                {fileUrl ? (
                  <Text fontSize="sm" color="gray.500" mt={2}>
                    Selected file: {fileUrl}
                  </Text>
                ) : null}
              </FormControl>
              <HStack justify="end">
                <Button variant="ghost" onClick={taskModal.onClose}>
                  Close
                </Button>
                <Button colorScheme="linkedin" onClick={handleTaskSubmit} isLoading={submittingTask}>
                  Mark as Done
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Shell>
  );
};
