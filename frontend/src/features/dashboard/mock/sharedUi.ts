export interface ProfileField {
  label: string;
  value: string;
}

export interface ProfileActivityItem {
  title: string;
  description: string;
  time: string;
}

export type ProfileStatIconKey = "book" | "badge" | "trend" | "clock";

export interface ProfileStat {
  label: string;
  value: string;
  icon: ProfileStatIconKey;
}

export interface ProfileSummary {
  name: string;
  roleLabel: string;
  email: string;
  joinedLabel: string;
  location: string;
  bio: string;
  initials: string;
  stats: ProfileStat[];
  activity: ProfileActivityItem[];
  personalInfo: ProfileField[];
}

export const teacherProfileSummary: ProfileSummary = {
  name: "Professor Doe",
  roleLabel: "Teacher",
  email: "professor@bilgenly.com",
  joinedLabel: "Joined March 2024",
  location: "San Francisco, CA",
  bio: "Computer science instructor focused on practical programming, classroom analytics, and quiz-driven learning.",
  initials: "PD",
  stats: [
    { label: "Quizzes Created", value: "28", icon: "book" },
    { label: "Classes Active", value: "5", icon: "badge" },
    { label: "Average Score", value: "82%", icon: "trend" },
    { label: "Review Time", value: "16hrs", icon: "clock" },
  ],
  activity: [
    {
      title: "Published quiz",
      description: "JavaScript Fundamentals for CS101",
      time: "1 hour ago",
    },
    {
      title: "Reviewed submissions",
      description: "Python Data Structures mid-week quiz",
      time: "Yesterday",
    },
    {
      title: "Created class",
      description: "Advanced Web Interfaces",
      time: "3 days ago",
    },
  ],
  personalInfo: [
    { label: "Full Name", value: "Professor Doe" },
    { label: "Email", value: "professor@bilgenly.com" },
    { label: "Phone", value: "+1 (555) 123-4567" },
    { label: "Location", value: "San Francisco, CA" },
  ],
};

export const studentProfileSummary: ProfileSummary = {
  name: "John Doe",
  roleLabel: "Student",
  email: "john.doe@bilgenly.com",
  joinedLabel: "Joined March 2025",
  location: "San Francisco, CA",
  bio: "Computer Science student passionate about learning new technologies. Currently focusing on web development and data structures.",
  initials: "JD",
  stats: [
    { label: "Quizzes Completed", value: "24", icon: "book" },
    { label: "Badges Earned", value: "12", icon: "badge" },
    { label: "Average Score", value: "88%", icon: "trend" },
    { label: "Study Time", value: "48hrs", icon: "clock" },
  ],
  activity: [
    {
      title: "Completed quiz",
      description: "Python Data Structures - 88%",
      time: "2 hours ago",
    },
    {
      title: "Earned badge",
      description: "Quick Learner",
      time: "1 day ago",
    },
    {
      title: "Joined quiz",
      description: "SQL Queries Practice",
      time: "2 days ago",
    },
  ],
  personalInfo: [
    { label: "Full Name", value: "John Doe" },
    { label: "Email", value: "john.doe@bilgenly.com" },
    { label: "Phone", value: "+1 (555) 123-4567" },
    { label: "Location", value: "San Francisco, CA" },
  ],
};
