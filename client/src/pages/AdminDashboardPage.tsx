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
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  VStack
} from "@chakra-ui/react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import { LeaderboardList } from "../components/LeaderboardList";
import { ResourceList, ResourceItem } from "../components/ResourceList";
import { Shell } from "../components/Shell";
import { useAuth } from "../contexts/AuthContext";
import { useToastMessage } from "../hooks/useToastMessage";

interface Task {
  _id: string;
  title: string;
  description: string;
  date: string;
  deadline: string;
  type: "daily" | "monthly";
  status: "active" | "archived";
  completedCount?: number;
  completedStudents?: string[];
}

interface Submission {
  _id: string;
  link?: string;
  message?: string;
  fileUrl?: string;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
  studentId: { name: string; username: string; registerNumber: string };
  taskId: { title: string; date: string; type: "daily" | "monthly" };
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
  studentId: { name: string; username: string; registerNumber: string };
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
  { key: "tasks", label: "Upload Tasks" },
  { key: "monthly", label: "Monthly Tasks" },
  { key: "submissions", label: "Verification System" },
  { key: "leaderboard", label: "Leaderboard" },
  { key: "announcements", label: "Announcements" },
  { key: "polls", label: "Polls" },
  { key: "leave", label: "Leave / OD Request" },
  { key: "schedule", label: "Schedule" },
  { key: "resources", label: "Resources" },
  { key: "profile", label: "My Profile" }
];

const defaultSchedule = [
  { day: "Monday", slots: ["Math", "Physics", "Lab", "Project"] },
  { day: "Tuesday", slots: ["English", "React", "Lab", "Mentoring"] },
  { day: "Wednesday", slots: ["DSA", "UI Design", "Library", "Sports"] },
  { day: "Thursday", slots: ["Database", "Node.js", "Lab", "Review"] },
  { day: "Friday", slots: ["Aptitude", "Chakra UI", "Project", "Club"] }
];

const resourcePdfMaxSizeMb = Math.max(Number(import.meta.env.VITE_RESOURCE_PDF_MAX_SIZE_MB || 100), 100);

const normalizeResourceUrl = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  try {
    const parsed = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return "";
    }

    return parsed.href;
  } catch {
    return "";
  }
};

export const AdminDashboardPage = () => {
  const { user, updateProfile } = useAuth();
  const toast = useToastMessage();
  const [activeSection, setActiveSection] = useState("tasks");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequestItem[]>([]);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [polls, setPolls] = useState<PollItem[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem>({ weeklyData: defaultSchedule });
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [taskType, setTaskType] = useState<"daily" | "monthly">("daily");
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementMessage, setAnnouncementMessage] = useState("");
  const [resourceTitle, setResourceTitle] = useState("");
  const [resourceUrl, setResourceUrl] = useState("");
  const [resourceType, setResourceType] = useState<"pdf" | "link" | "poll">("link");
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", "", "", ""]);
  const [profileName, setProfileName] = useState("");
  const [profileRegisterNumber, setProfileRegisterNumber] = useState("");
  const [profilePassword, setProfilePassword] = useState("");
  const [resourceFile, setResourceFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [savingSchedule, setSavingSchedule] = useState(false);

  const loadData = async () => {
    const [
      tasksResponse,
      submissionsResponse,
      leaderboardResponse,
      announcementsResponse,
      leaveResponse,
      resourcesResponse,
      pollsResponse,
      scheduleResponse
    ] = await Promise.all([
      api.get("/tasks"),
      api.get("/submissions"),
      api.get("/leaderboard"),
      api.get("/announcements"),
      api.get("/leave-requests"),
      api.get("/resources"),
      api.get("/polls"),
      api.get("/schedule")
    ]);

    setTasks(tasksResponse.data);
    setSubmissions(submissionsResponse.data);
    setLeaderboard(leaderboardResponse.data);
    setAnnouncements(announcementsResponse.data);
    setLeaveRequests(leaveResponse.data);
    setResources(resourcesResponse.data);
    setPolls(pollsResponse.data);
    setSchedule(scheduleResponse.data?.weeklyData?.length ? scheduleResponse.data : { weeklyData: defaultSchedule });
  };

  useEffect(() => {
    setProfileName(user?.name || "");
    setProfileRegisterNumber(user?.registerNumber || "");
  }, [user?.name, user?.registerNumber]);

  useEffect(() => {
    loadData().catch((error: any) => {
      toast.error("Couldn't load admin panel", error.response?.data?.message || "Please refresh and try again.");
    });
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      api.get("/tasks").then((response) => setTasks(response.data)).catch(() => undefined);
    }, 15000);

    return () => window.clearInterval(interval);
  }, []);

  const dailyTasks = useMemo(() => tasks.filter((task) => task.type === "daily"), [tasks]);
  const monthlyTasks = useMemo(() => tasks.filter((task) => task.type === "monthly"), [tasks]);

  const handleCreateTask = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await api.post("/tasks", {
        title,
        description,
        date,
        deadline,
        type: taskType
      });
      toast.success("Task added", "Students can now view the task.");
      setTitle("");
      setDescription("");
      setDate("");
      setDeadline("");
      setTaskType("daily");
      await loadData();
    } catch (error: any) {
      toast.error("Couldn't create task", error.response?.data?.message || "Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAnnouncementSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await api.post("/announcements", {
        title: announcementTitle,
        message: announcementMessage
      });
      setAnnouncementTitle("");
      setAnnouncementMessage("");
      toast.success("Announcement posted", "Students can see it now.");
      await loadData();
    } catch (error: any) {
      toast.error("Couldn't post announcement", error.response?.data?.message || "Please try again.");
    }
  };

  const handleResourceSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const formData = new FormData();
      formData.append("title", resourceTitle);
      formData.append("resourceType", resourceType);

      if (resourceType === "pdf") {
        if (!resourceFile) {
          toast.error("Please select at least one PDF file.");
          return;
        }
        if (resourceFile.type !== "application/pdf" || !resourceFile.name.toLowerCase().endsWith(".pdf")) {
          toast.error("Only PDF files are allowed.");
          return;
        }
        if (resourceFile.size > resourcePdfMaxSizeMb * 1024 * 1024) {
          toast.error(`PDF files must be ${resourcePdfMaxSizeMb}MB or smaller.`);
          return;
        }
        formData.append("file", resourceFile);
      } else {
        const normalizedUrl = normalizeResourceUrl(resourceUrl);
        if (!normalizedUrl) {
          toast.error(resourceType === "poll" ? "Please enter a poll URL." : "Please enter a valid URL.");
          return;
        }
        formData.append("fileUrl", normalizedUrl);
      }

      await api.post("/resources", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setResourceTitle("");
      setResourceUrl("");
      setResourceFile(null);
      setResourceType("link");
      toast.success("Resource added", "Students can open it from resources.");
      await loadData();
    } catch (error: any) {
      toast.error("Couldn't add resource", error.response?.data?.message || "Please try again.");
    }
  };

  const handleCreatePoll = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await api.post("/polls", {
        question: pollQuestion,
        options: pollOptions.filter((option) => option.trim())
      });
      setPollQuestion("");
      setPollOptions(["", "", "", ""]);
      toast.success("Poll created", "Students can respond now.");
      await loadData();
    } catch (error: any) {
      toast.error("Couldn't create poll", error.response?.data?.message || "Please try again.");
    }
  };

  const handleSaveSchedule = async (event: FormEvent) => {
    event.preventDefault();
    setSavingSchedule(true);

    try {
      await api.put("/schedule", { weeklyData: schedule.weeklyData });
      toast.success("Schedule saved", "Students will see the latest timetable.");
      await loadData();
    } catch (error: any) {
      toast.error("Couldn't save schedule", error.response?.data?.message || "Please try again.");
    } finally {
      setSavingSchedule(false);
    }
  };

  const handleProfileSave = async (event: FormEvent) => {
    event.preventDefault();
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
    }
  };

  const updateSubmissionStatus = async (id: string, status: "approved" | "rejected") => {
    try {
      await api.patch(`/submissions/${id}/status`, { status });
      toast.success("Submission updated", `Status changed to ${status}.`);
      await loadData();
    } catch (error: any) {
      toast.error("Couldn't update submission", error.response?.data?.message || "Please try again.");
    }
  };

  const updateLeaveStatus = async (id: string, status: "approved" | "rejected") => {
    try {
      await api.patch(`/leave-requests/${id}/status`, { status });
      toast.success("Request updated", `Status changed to ${status}.`);
      await loadData();
    } catch (error: any) {
      toast.error("Couldn't update request", error.response?.data?.message || "Please try again.");
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await api.delete(`/tasks/${id}`);
      toast.success("Task deleted", "Task has been removed.");
      await loadData();
    } catch (error: any) {
      toast.error("Couldn't delete task", error.response?.data?.message || "Please try again.");
    }
  };

  const deleteAnnouncement = async (id: string) => {
    try {
      await api.delete(`/announcements/${id}`);
      toast.success("Announcement deleted", "Announcement has been removed.");
      await loadData();
    } catch (error: any) {
      toast.error("Couldn't delete announcement", error.response?.data?.message || "Please try again.");
    }
  };

  const deletePoll = async (id: string) => {
    try {
      await api.delete(`/polls/${id}`);
      toast.success("Poll deleted", "Poll has been removed.");
      await loadData();
    } catch (error: any) {
      toast.error("Couldn't delete poll", error.response?.data?.message || "Please try again.");
    }
  };

  const deleteResource = async (id: string) => {
    try {
      await api.delete(`/resources/${id}`);
      toast.success("Resource deleted", "Resource has been removed.");
      await loadData();
    } catch (error: any) {
      toast.error("Couldn't delete resource", error.response?.data?.message || "Please try again.");
    }
  };

  const updateScheduleSlot = (index: number, value: string) => {
    setSchedule((prev) => ({
      weeklyData: prev.weeklyData.map((item, itemIndex) =>
        itemIndex === index ? { ...item, slots: value.split(",").map((slot) => slot).filter(Boolean) } : item
      )
    }));
  };

  const renderTaskSection = (items: Task[], label: string) => (
    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr", xl: "1.1fr 1fr" }} gap={6}>
      <GridItem>
        <Card bgGradient="linear(to-br, white, brand.50, mint.50)">
          <CardBody>
            <VStack as="form" onSubmit={handleCreateTask} align="stretch" spacing={4}>
              <Box>
                <Heading size="md" mb={2}>
                  {label}
                </Heading>
                <Text color="gray.500">Upload new work items for students.</Text>
              </Box>
              <FormControl>
                <FormLabel>Title</FormLabel>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </FormControl>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
              </FormControl>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <FormControl>
                  <FormLabel>Date</FormLabel>
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </FormControl>
                <FormControl>
                  <FormLabel>Deadline</FormLabel>
                  <Input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                </FormControl>
                <FormControl>
                  <FormLabel>Type</FormLabel>
                  <Select value={taskType} onChange={(e) => setTaskType(e.target.value as "daily" | "monthly")}>
                    <option value="daily">Daily</option>
                    <option value="monthly">Monthly</option>
                  </Select>
                </FormControl>
              </SimpleGrid>
              <Button type="submit" colorScheme="linkedin" isLoading={submitting} w="full">
                Upload Task
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </GridItem>
      <GridItem>
        <Card>
          <CardBody>
            <Heading size="md" mb={4}>
              Existing tasks
            </Heading>
            <VStack align="stretch" spacing={3}>
              {items.map((task) => (
                <Box key={task._id} p={4} borderRadius="xl" bg="gray.50">
                  <Stack direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "start", md: "start" }} gap={4}>
                    <Box flex="1" minW={0}>
                      <Text fontWeight="700">{task.title}</Text>
                      <Text color="gray.600" mt={2} wordBreak="break-word">
                        {task.description}
                      </Text>
                      <Text fontSize="sm" color="gray.500" mt={2}>
                        {new Date(task.date).toLocaleDateString()} · due {new Date(task.deadline).toLocaleString()}
                      </Text>
                      <Text fontSize="sm" color="gray.600" mt={3}>
                        Completed by {task.completedCount || 0} students
                      </Text>
                      {task.completedStudents?.length ? (
                        <Text fontSize="sm" color="gray.500" mt={1}>
                          {task.completedStudents.join(", ")}
                        </Text>
                      ) : null}
                    </Box>
                    <Button size="sm" colorScheme="red" variant="outline" onClick={() => deleteTask(task._id)} w={{ base: "full", md: "auto" }}>
                      Delete
                    </Button>
                  </Stack>
                </Box>
              ))}
            </VStack>
          </CardBody>
        </Card>
      </GridItem>
    </Grid>
  );

  const renderSection = () => {
    switch (activeSection) {
      case "monthly":
        return renderTaskSection(monthlyTasks, "Monthly tasks");
      case "submissions":
        return (
          <VStack align="stretch" spacing={4}>
            <Heading size="md">Verification system</Heading>
            <Card>
              <CardBody>
                <Heading size="sm" mb={4}>
                  Logged-in user details
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                  <Box>
                    <Text fontSize="sm" color="gray.500">
                      Name
                    </Text>
                    <Text fontWeight="700">{user?.name || "Not Available"}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.500">
                      Username
                    </Text>
                    <Text fontWeight="700">{user?.username || "Not Available"}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.500">
                      Register Number
                    </Text>
                    <Text fontWeight="700">{user?.registerNumber || "Not Available"}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.500">
                      Gmail ID
                    </Text>
                    <Text fontWeight="700">{user?.email || "Not Available"}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.500">
                      Role
                    </Text>
                    <Text fontWeight="700" textTransform="capitalize">
                      {user?.role || "Not Available"}
                    </Text>
                  </Box>
                </SimpleGrid>
              </CardBody>
            </Card>
            {submissions.map((submission) => (
              <Card key={submission._id}>
                <CardBody>
                  <HStack justify="space-between" align="start" spacing={4}>
                    <Box>
                      <Text fontWeight="700">
                        {submission.studentId.name} · @{submission.studentId.username.toUpperCase()}
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        {submission.studentId.registerNumber} · {submission.taskId.title} · {submission.taskId.type}
                      </Text>
                      {submission.link ? (
                        <Text mt={3}>
                          Link:{" "}
                          <Button as="a" href={submission.link} target="_blank" rel="noreferrer" size="xs" variant="link" colorScheme="linkedin">
                            Open
                          </Button>
                        </Text>
                      ) : null}
                      {submission.fileUrl ? (
                        <Text mt={2} color="gray.600">
                          File: {submission.fileUrl}
                        </Text>
                      ) : null}
                      {submission.message ? <Text mt={2}>{submission.message}</Text> : null}
                    </Box>
                    <VStack align="stretch">
                      <Text fontSize="sm" color="gray.500">
                        Status: {submission.status}
                      </Text>
                      <Button size="sm" colorScheme="green" onClick={() => updateSubmissionStatus(submission._id, "approved")}>
                        Approve
                      </Button>
                      <Button size="sm" colorScheme="red" variant="outline" onClick={() => updateSubmissionStatus(submission._id, "rejected")}>
                        Reject
                      </Button>
                    </VStack>
                  </HStack>
                </CardBody>
              </Card>
            ))}
          </VStack>
        );
      case "leaderboard":
        return (
          <Card>
            <CardBody>
              <Heading size="md" mb={4}>
                Approved-task leaderboard
              </Heading>
              <LeaderboardList entries={leaderboard} />
            </CardBody>
          </Card>
        );
      case "announcements":
        return (
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
            <GridItem>
              <Card>
                <CardBody>
                  <VStack as="form" onSubmit={handleAnnouncementSubmit} align="stretch" spacing={4}>
                    <Heading size="md">Post announcement</Heading>
                    <FormControl>
                      <FormLabel>Title</FormLabel>
                      <Input value={announcementTitle} onChange={(e) => setAnnouncementTitle(e.target.value)} />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Message</FormLabel>
                      <Textarea value={announcementMessage} onChange={(e) => setAnnouncementMessage(e.target.value)} />
                    </FormControl>
                    <Button type="submit" colorScheme="purple" w="full">
                      Post
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            </GridItem>
            <GridItem>
              <Card>
                <CardBody>
                  <Heading size="md" mb={4}>
                    Announcements + replies
                  </Heading>
                  <VStack align="stretch" spacing={4}>
                    {announcements.map((announcement) => (
                      <Box key={announcement._id} p={4} borderRadius="xl" bg="gray.50">
                        <Stack direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "start", md: "start" }} gap={4}>
                          <Box flex="1" minW={0}>
                            <Text fontWeight="700">{announcement.title}</Text>
                            <Text color="gray.600" mt={2} wordBreak="break-word">
                              {announcement.message}
                            </Text>
                            <VStack align="stretch" spacing={2} mt={3}>
                              {announcement.replies.map((reply, index) => (
                                <Box key={`${announcement._id}-${index}`} p={3} borderRadius="lg" bg="white">
                                  <Text fontWeight="700">@{reply.username.toUpperCase()}</Text>
                                  <Text color="gray.600">{reply.message}</Text>
                                </Box>
                              ))}
                            </VStack>
                          </Box>
                          <Button size="sm" colorScheme="red" variant="outline" onClick={() => deleteAnnouncement(announcement._id)} w={{ base: "full", md: "auto" }}>
                            Delete
                          </Button>
                        </Stack>
                      </Box>
                    ))}
                  </VStack>
                </CardBody>
              </Card>
            </GridItem>
          </Grid>
        );
      case "polls":
        return (
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
            <GridItem>
              <Card>
                <CardBody>
                  <VStack as="form" align="stretch" spacing={4} onSubmit={handleCreatePoll}>
                    <Heading size="md">Create poll</Heading>
                    <FormControl>
                      <FormLabel>Question</FormLabel>
                      <Input value={pollQuestion} onChange={(e) => setPollQuestion(e.target.value)} />
                    </FormControl>
                    {pollOptions.map((option, index) => (
                      <FormControl key={`poll-option-${index}`}>
                        <FormLabel>Option {index + 1}</FormLabel>
                        <Input
                          value={option}
                          onChange={(e) =>
                            setPollOptions((prev) => prev.map((item, itemIndex) => (itemIndex === index ? e.target.value : item)))
                          }
                        />
                      </FormControl>
                    ))}
                    <Button type="submit" colorScheme="linkedin" w="full">
                      Save Poll
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            </GridItem>
            <GridItem>
              <Card>
                <CardBody>
                  <Heading size="md" mb={4}>
                    Poll results
                  </Heading>
                  <VStack align="stretch" spacing={4}>
                    {polls.map((poll) => {
                      const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);
                      return (
                        <Box key={poll._id} p={4} borderRadius="xl" bg="gray.50">
                          <Stack direction={{ base: "column", sm: "row" }} justify="space-between" align={{ base: "start", sm: "start" }} mb={3} gap={3}>
                            <Text fontWeight="700" wordBreak="break-word">{poll.question}</Text>
                            <Button size="sm" colorScheme="red" variant="outline" onClick={() => deletePoll(poll._id)} w={{ base: "full", sm: "auto" }}>
                              Delete
                            </Button>
                          </Stack>
                          <VStack align="stretch" spacing={3}>
                            {poll.options.map((option, index) => {
                              const percentage = totalVotes ? Math.round((option.votes / totalVotes) * 100) : 0;
                              return (
                                <Box key={`${poll._id}-${index}`}>
                                  <HStack justify="space-between" mb={1}>
                                    <Text>{option.text}</Text>
                                    <Text fontSize="sm" color="gray.500">
                                      {percentage}%
                                    </Text>
                                  </HStack>
                                  <Box h="10px" borderRadius="full" bg="gray.200" overflow="hidden">
                                    <Box h="full" w={`${percentage}%`} bg="brand.400" borderRadius="full" />
                                  </Box>
                                </Box>
                              );
                            })}
                          </VStack>
                        </Box>
                      );
                    })}
                  </VStack>
                </CardBody>
              </Card>
            </GridItem>
          </Grid>
        );
      case "leave":
        return (
          <VStack align="stretch" spacing={4}>
            <Heading size="md">Leave / OD requests</Heading>
            {leaveRequests.map((request) => (
              <Card key={request._id}>
                <CardBody>
                  <HStack justify="space-between" align="start">
                    <Box>
                      <Text fontWeight="700">
                        {request.studentId.name} · @{request.studentId.username.toUpperCase()}
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        {request.studentId.registerNumber} · {request.type.toUpperCase()} · {new Date(request.date).toLocaleDateString()}
                      </Text>
                      <Text mt={2}>{request.reason}</Text>
                    </Box>
                    <VStack align="stretch">
                      <Text fontSize="sm" color="gray.500">
                        Status: {request.status}
                      </Text>
                      <Button size="sm" colorScheme="green" onClick={() => updateLeaveStatus(request._id, "approved")}>
                        Approve
                      </Button>
                      <Button size="sm" colorScheme="red" variant="outline" onClick={() => updateLeaveStatus(request._id, "rejected")}>
                        Reject
                      </Button>
                    </VStack>
                  </HStack>
                </CardBody>
              </Card>
            ))}
          </VStack>
        );
      case "schedule":
        return (
          <Card>
            <CardBody>
              <VStack as="form" align="stretch" spacing={4} onSubmit={handleSaveSchedule}>
                <Heading size="md">Weekly timetable</Heading>
                {schedule.weeklyData.map((item, index) => (
                  <FormControl key={item.day}>
                    <FormLabel>{item.day}</FormLabel>
                    <Input value={item.slots.join(", ")} onChange={(e) => updateScheduleSlot(index, e.target.value)} />
                  </FormControl>
                ))}
                <Button type="submit" colorScheme="purple" isLoading={savingSchedule} w="full">
                  Save Schedule
                </Button>
              </VStack>
            </CardBody>
          </Card>
        );
      case "resources":
        return (
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
            <GridItem>
              <Card>
                <CardBody>
                  <VStack as="form" onSubmit={handleResourceSubmit} align="stretch" spacing={4}>
                    <Heading size="md">Upload resource</Heading>
                    <FormControl>
                      <FormLabel>Title</FormLabel>
                      <Input value={resourceTitle} onChange={(e) => setResourceTitle(e.target.value)} />
                    </FormControl>
                    <FormControl>
                      <FormLabel>{resourceType === "pdf" ? "PDF file" : resourceType === "poll" ? "Poll URL" : "Link URL"}</FormLabel>
                      {resourceType === "pdf" ? (
                        <Input
                          type="file"
                          accept="application/pdf"
                          p={1}
                          onChange={(e) => setResourceFile(e.target.files?.[0] || null)}
                        />
                      ) : (
                        <Input
                          value={resourceUrl}
                          onChange={(e) => setResourceUrl(e.target.value)}
                          placeholder={resourceType === "poll" ? "https://..." : "https://..."}
                        />
                      )}
                      <Text fontSize="sm" color="gray.500" mt={2}>
                        PDF uploads are limited to {resourcePdfMaxSizeMb}MB.
                      </Text>
                    </FormControl>
                    <FormControl>
                      <FormLabel>Type</FormLabel>
                      <HStack>
                        <Button type="button" variant={resourceType === "link" ? "solid" : "outline"} onClick={() => setResourceType("link")}>
                          Link
                        </Button>
                        <Button type="button" variant={resourceType === "pdf" ? "solid" : "outline"} onClick={() => setResourceType("pdf")}>
                          PDF
                        </Button>
                        <Button type="button" variant={resourceType === "poll" ? "solid" : "outline"} onClick={() => setResourceType("poll")}>
                          Poll
                        </Button>
                      </HStack>
                    </FormControl>
                    <Button type="submit" colorScheme="linkedin" w="full">
                      Save Resource
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            </GridItem>
            <GridItem>
              <Card>
              <CardBody>
                  <ResourceList resources={resources} onDelete={deleteResource} />
                </CardBody>
              </Card>
            </GridItem>
          </Grid>
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
                <Button type="submit" colorScheme="purple" w="full">
                  Save Profile
                </Button>
              </VStack>
            </CardBody>
          </Card>
        );
      case "tasks":
      default:
        return renderTaskSection(dailyTasks, "Upload tasks");
    }
  };

  return (
    <Shell menuItems={MENU_ITEMS} activeKey={activeSection} onSelect={setActiveSection} title="Admin Control" subtitle="admin">
      {renderSection()}
    </Shell>
  );
};
