import React from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import { Card, Heading, ScrollArea, Text } from "@radix-ui/themes";
import Header from "../../components/dashboard/Header";
import {
  Calendar1,
  CircleCheck,
  ClockAlert,
  PersonStanding,
  UserRoundX,
} from "lucide-react";
import { AppConstants } from "../../constants/app.constants";
import { members } from "../../data/members";
import { sessions } from "../../data/sessions";
import { attendance } from "../../data/attendance";

const Dashboard: React.FC = () => {
  const currentMembers = AppConstants.currentMembers;
  const pastMembers = AppConstants.pastMembers;
  const difference = currentMembers - pastMembers;

  const attendanceRate = 94;
  const lateArrivals = 35;
  const absent = 100;

  const percentageInDifference =
    (difference / (currentMembers + pastMembers)) * 100;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* SIDEBAR */}
      <div className="w-270px shrink-0">
        <ScrollArea type="auto" className="h-full">
          <Sidebar />
        </ScrollArea>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-x-hidden">
        <ScrollArea type="auto" className="h-full">
          <div className="p-4 max-w-full">
            {/* HEADER */}
            <Header />
            <hr className="my-4 border-gray-700/40" />

            {/* PAGE TITLE */}
            <div className="mb-6">
              <Heading>Dashboard</Heading>
              <Text className="text-gray-500">
                Welcome back! Here's your attendance overview.
              </Text>
            </div>

            {/* SUMMARY CARDS */}
            <div
              className="
                grid gap-4
                grid-cols-1
                sm:grid-cols-2
                lg:grid-cols-3
                xl:grid-cols-6
              "
            >
              <SummaryCard
                title="Members"
                value={members.length}
                icon={<PersonStanding size={20} />}
                isPositive={percentageInDifference >= 0}
                subTitle={`${
                  percentageInDifference > 0 ? "+" : ""
                }${percentageInDifference.toFixed(1)}% vs last week`}
                type="members"
              />

              <SummaryCard
                title="Active Sessions"
                value={sessions.length}
                icon={<Calendar1 size={20} />}
                type="sessions"
              />

              <SummaryCard
                title="Today's Attendance"
                value={attendance.length}
                icon={<CircleCheck size={20} />}
                type="attendance"
              />

              <SummaryCard
                title="Attendance Rate"
                value={`${attendanceRate}%`}
                icon={<CircleCheck size={20} />}
                subTitle="+2.4% vs last week"
                type="attendanceRate"
                isPositive={attendanceRate >= 0}
              />

              <SummaryCard
                title="Late Arrivals"
                value={lateArrivals}
                icon={<ClockAlert size={20} />}
                subTitle="+2.4% vs last week"
                type="late"
                isPositive={lateArrivals >= 0}
              />

              <SummaryCard
                title="Absentees"
                value={absent}
                icon={<UserRoundX size={20} />}
                subTitle="+2.4% vs last week"
                type="absent"
                isPositive={absent >= 0}
              />
            </div>
          </div>
          {/*charts section*/}
          <div>
            <Card>
              <div className="flex justify-between">
                <div className="flex flex-col">
                  <p>Weekly Attendance</p>
                  <p>Attendance trends for this week</p>
                </div>

                {/**/}
                <div className="flex">
                  <div className="w-2 h-2 rounded-full bg-accent"></div>
                  <span>Present</span>
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span>Absent</span>
                </div>
              </div>

              {/*chart display*/}
              <div></div>
            </Card>
            <Card></Card>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default Dashboard;

type SummaryCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subTitle?: string;
  isPositive?: boolean;
  type:
    | "members"
    | "sessions"
    | "reports"
    | "attendance"
    | "attendanceRate"
    | "late"
    | "absent";
};

const typeStyles: Record<string, string> = {
  members: "text-blue-400 bg-blue-500/10",
  sessions: "text-purple-400 bg-purple-500/10",
  attendance: "text-green-400 bg-green-500/10",
  attendanceRate: "text-emerald-400 bg-emerald-500/10",
  late: "text-yellow-400 bg-yellow-500/10",
  absent: "text-red-400 bg-red-500/10",
};

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  icon,
  subTitle,
  isPositive = true,
  type,
}) => {
  return (
    <Card
      className="
        h-150px
        rounded-xl
        border border-gray-800/40
        bg-slate-900/40
        backdrop-blur
        transition-all duration-300
        hover:scale-[1.02]
      "
    >
      <div className="flex flex-col justify-between h-full p-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-400 font-medium">{title}</p>
          <div className={`p-2 rounded-lg ${typeStyles[type]}`}>{icon}</div>
        </div>

        {/* Value */}
        <div>
          <p className="text-3xl font-bold text-white">{value}</p>
          {subTitle && (
            <p
              className={`text-xs mt-1 ${
                isPositive ? "text-green-400" : "text-red-400"
              }`}
            >
              {subTitle}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};
