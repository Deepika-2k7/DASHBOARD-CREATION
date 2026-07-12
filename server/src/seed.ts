import bcrypt from "bcryptjs";
import { connectDb } from "./config/db.js";
import { Announcement } from "./models/Announcement.js";
import { LeaveRequest } from "./models/LeaveRequest.js";
import { Poll } from "./models/Poll.js";
import { Resource } from "./models/Resource.js";
import { Schedule } from "./models/Schedule.js";
import { Submission } from "./models/Submission.js";
import { Task } from "./models/Task.js";
import { User } from "./models/User.js";

const run = async () => {
  await connectDb();

  await Promise.all([
    Submission.deleteMany({}),
    Task.deleteMany({}),
    User.deleteMany({}),
    Announcement.deleteMany({}),
    LeaveRequest.deleteMany({}),
    Resource.deleteMany({}),
    Poll.deleteMany({}),
    Schedule.deleteMany({})
  ]);

  const passwordHash = await bcrypt.hash("password123", 10);

  const users = await User.create([
    { name: "Ava Johnson", username: "ava", registerNumber: "ADM001", password: passwordHash, role: "admin" },
    { name: "Liam Chen", username: "liam", registerNumber: "STU101", password: passwordHash, role: "student" },
    { name: "Maya Singh", username: "maya", registerNumber: "STU102", password: passwordHash, role: "student" },
    { name: "Noah Patel", username: "noah", registerNumber: "STU103", password: passwordHash, role: "student" }
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 20, 0, 0, 0);

  const tasks = await Task.create([
    {
      title: "Quick Reflection",
      description: "Write 3 things you learned today and one question you still have.",
      date: yesterday,
      deadline: new Date(new Date(yesterday).setHours(22, 0, 0, 0)),
      type: "daily"
    },
    {
      title: "Build Sprint",
      description: "Share a short summary, screenshot, or code snippet from today's work session.",
      date: today,
      deadline: new Date(new Date(today).setHours(21, 0, 0, 0)),
      type: "daily"
    },
    {
      title: "Monthly Portfolio Update",
      description: "Upload your monthly portfolio notes and progress summary.",
      date: monthStart,
      deadline: monthEnd,
      type: "monthly"
    }
  ]);

  const liam = users.find((user) => user.username === "liam");
  const maya = users.find((user) => user.username === "maya");

  if (liam && maya) {
    await Submission.create([
      {
        studentId: liam._id,
        taskId: tasks[0]._id,
        link: "https://example.com/liam-reflection",
        message: "Wrapped up my notes and reviewed the tricky parts.",
        fileUrl: "liam-notes.pdf",
        submittedAt: new Date(new Date(yesterday).setHours(18, 45, 0, 0)),
        status: "approved"
      },
      {
        studentId: maya._id,
        taskId: tasks[0]._id,
        link: "https://example.com/maya-reflection",
        message: "Finished the worksheet and checked my answers.",
        fileUrl: "maya-summary.pdf",
        submittedAt: new Date(new Date(yesterday).setHours(20, 15, 0, 0)),
        status: "approved"
      }
    ]);
  }

  await Announcement.create([
    {
      title: "Sprint Review",
      message: "Monthly review submissions are due this Friday.",
      replies: [
        {
          userId: liam?._id,
          username: "liam",
          message: "I'll upload mine before Thursday evening.",
          createdAt: new Date()
        }
      ]
    },
    {
      title: "Lab Access",
      message: "The lab will stay open until 6 PM for project work this week."
    }
  ]);

  await Resource.create([
    {
      title: "React Fundamentals PDF",
      fileUrl: "https://example.com/react-fundamentals.pdf",
      resourceType: "pdf"
    },
    {
      title: "Chakra UI Docs",
      fileUrl: "https://chakra-ui.com",
      resourceType: "link"
    }
  ]);

  await Poll.create({
    question: "Which slot works best for the next review session?",
    options: [
      { text: "Morning", votes: 2 },
      { text: "Afternoon", votes: 1 },
      { text: "Evening", votes: 0 }
    ],
    responses: liam && maya ? [{ studentId: liam._id, optionIndex: 0 }, { studentId: maya._id, optionIndex: 1 }] : []
  });

  await Schedule.create({
    weeklyData: [
      { day: "Monday", slots: ["Math", "Physics", "Lab", "Project"] },
      { day: "Tuesday", slots: ["English", "React", "Lab", "Mentoring"] },
      { day: "Wednesday", slots: ["DSA", "UI Design", "Library", "Sports"] },
      { day: "Thursday", slots: ["Database", "Node.js", "Lab", "Review"] },
      { day: "Friday", slots: ["Aptitude", "Chakra UI", "Project", "Club"] }
    ]
  });

  console.log("Seed data created");
  process.exit(0);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
