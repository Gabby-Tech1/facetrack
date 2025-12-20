import React from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import {
  Box,
  Card,
  Heading,
  Progress,
  ScrollArea,
  Text,
} from "@radix-ui/themes";
import Header from "../../components/dashboard/Header";
import {
  AlarmClockCheck,
  Award,
  AwardIcon,
  Calendar1,
  CircleCheck,
  Clock,
  ClockAlert,
  LocateIcon,
  LucideAward,
  PersonStanding,
  TrophyIcon,
  UserRoundX,
} from "lucide-react";
import { AppConstants } from "../../constants/app.constants";
import { members } from "../../data/members";
import { sessions } from "../../data/sessions";
import { attendance } from "../../data/attendance";
import {
  Area,
  AreaChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { chartData } from "../../data/chart-data";
import { recentActivities } from "../../data/recent-actiivities";
import { AppServices } from "../../services/app-services";

const Dashboard: React.FC = () => {
  const currentMembers = AppConstants.currentMembers;
  const pastMembers = AppConstants.pastMembers;
  const difference = currentMembers - pastMembers;

  const attendanceRate = 94;
  const lateArrivals = 35;
  const absent = 100;

  const percentageInDifference =
    (difference / (currentMembers + pastMembers)) * 100;

  const services = new AppServices();

  const sessionsData = sessions;

  const activeSessions = sessionsData.filter(
    (session) => session.status === "active" || session.status === "scheduled"
  );

  const earlyArrivals = services.getEarlyArrivals(attendance);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* SIDEBAR */}
      <div className="shrink-0 h-screen">
        <ScrollArea type="auto" className="h-screen">
          <Sidebar />
        </ScrollArea>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-x-hidden">
        <ScrollArea type="auto" className="h-full overflow-x-hidden">
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
          <div className="grid lg:grid-cols-3 gap-4 lg:gap-10 grid-cols-1 p-4">
            <Card className="flex flex-1 lg:col-span-2 bg-slate-900/40 backdrop-blur border border-gray-800/40 rounded-xl p-6">
              <div className="flex justify-between">
                <div className="flex flex-col items-start mb-4">
                  <p className="text-white antialiased text-lg font-sans font-medium">
                    Weekly Attendance
                  </p>
                  <p className="text-gray-400/90 text-sm">
                    Attendance trends for this week
                  </p>
                </div>
              </div>

              {/*chart display*/}
              <div style={{ width: "100%", height: "300px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="presentGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#22c55e"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#22c55e"
                          stopOpacity={0}
                        />
                      </linearGradient>

                      <linearGradient
                        id="absentGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#ef4444"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#ef4444"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>

                    {/* <CartesianGrid strokeDasharray="0 0" /> */}
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />

                    <Area
                      type="monotone"
                      dataKey="present"
                      stroke="#22c55e"
                      fill="url(#presentGradient)"
                      fillOpacity={1}
                    />

                    <Area
                      type="monotone"
                      dataKey="absent"
                      stroke="#ef4444"
                      fill="url(#absentGradient)"
                      fillOpacity={1}
                    />
                    <Area
                      type="monotone"
                      dataKey="late"
                      stroke="#f59e0b"
                      fill="url(#lateGradient)"
                      fillOpacity={1}
                    />

                    <Tooltip />
                    <Legend verticalAlign="top" height={36} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card className="lg:col-span-1 flex flex-col p-6 bg-slate-900/40 backdrop-blur border border-gray-800/40 rounded-xl">
              <div className="flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-white font-sans font-medium text-lg">
                    Recent Activities
                  </p>
                  <p className="text-sm text-gray-400/90 antialised">
                    Live updates
                  </p>
                </div>
                {recentActivities.slice(0, 4).map((activity) => (
                  <div
                    key={activity.id}
                    className="flex justify-between items-center my-4"
                  >
                    <div className="flex justify-start items-start gap-3">
                      {activity.status === "present" ? (
                        <div className="p-2 rounded-lg bg-green-500/10 text-yellow-400">
                          <AlarmClockCheck className="text-green-400" />
                        </div>
                      ) : activity.status === "absent" ? (
                        <div className="p-2 rounded-lg bg-red-500/10 text-red-900">
                          <UserRoundX className="text-red-900" />
                        </div>
                      ) : (
                        <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-400">
                          <ClockAlert className="text-yellow-400" />
                        </div>
                      )}{" "}
                      <div>
                        <p className="font-medium text-md text-white antialiased ">
                          {activity.memberName}
                        </p>
                        <p className="font-medium text-xs text-gray-400/90 antialiased ">
                          {activity.activity}
                        </p>
                        <p className="text-gray-500 text-xs antialiased ">
                          {activity.date.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p
                        className={`
                          w-2 h-2 rounded-full text-sm font-medium
                          ${
                            activity.status === "present"
                              ? "bg-green-100 text-green-900"
                              : activity.status === "absent"
                              ? "bg-red-100 text-red-950"
                              : "bg-yellow-100 text-yellow-800"
                          }
                        `}
                      ></p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/*card for early arrival list*/}
          <div className="m-4">
            <Card className="bg-slate-900/40 backdrop-blur border border-gray-800/40 rounded-xl ">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-400">
                    <TrophyIcon size={18} />
                  </div>
                  <p className="text-white font-medium text-lg">
                    Early Arrival Rewards
                  </p>
                </div>

                <p className="text-sm text-gray-400">Current Month</p>
              </div>
              {/* Subtitle */}
              <p className="text-sm text-gray-400/90 mb-6">
                Recognising punctual members who arrived early
              </p>
              {/* List */}

              <div className="flex flex-col gap-4">
                {earlyArrivals.length === 0 ? (
                  <p className="text-gray-500 text-center">
                    No early arrivals this month.
                  </p>
                ) : (
                  earlyArrivals.map((member, index) => {
                    const user = member.members?.[0]?.user;
                    if (!user) return null;

                    const rankIcon =
                      index === 0 ? (
                        <TrophyIcon className="text-yellow-400" />
                      ) : index === 1 ? (
                        <Award className="text-gray-400" />
                      ) : index === 2 ? (
                        <AwardIcon className="text-yellow-700" />
                      ) : (
                        <LucideAward className="text-gray-600" />
                      );

                    const rankLabel =
                      index === 0
                        ? "1st"
                        : index === 1
                        ? "2nd"
                        : index === 2
                        ? "3rd"
                        : `${index + 1}th`;

                    const rankStyle =
                      index === 0
                        ? "text-yellow-400 bg-yellow-500/10"
                        : index === 1
                        ? "text-gray-400 bg-gray-500/10"
                        : index === 2
                        ? "text-yellow-700 bg-yellow-500/10"
                        : "text-gray-600 bg-gray-500/10";

                    return (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition"
                      >
                        <div className="flex items-center gap-5">
                          {rankIcon}

                          <div className="flex items-center gap-3">
                            <img
                              src={user.profilePicture}
                              alt={user.name}
                              className="w-9 h-9 rounded-full object-cover"
                            />

                            <div>
                              <p className="text-xs text-gray-400 break-all sm:break-normal truncate max-w-160px">
                                {user.name}
                              </p>
                              <p className="text-xs text-gray-400 break-all sm:break-normal truncate max-w-160px">
                                {user.email}
                              </p>
                            </div>
                          </div>

                          <div
                            className={`flex items-center justify-center px-3 py-1 rounded-2xl text-sm font-semibold ${rankStyle}`}
                          >
                            {rankLabel}
                          </div>
                        </div>

                        <div>
                          <Clock
                            className="inline-block mr-2 text-green-400"
                            size={13}
                          />
                          <span className="text-green-400 text-xs font-semibold">
                            +
                            {services.getDiffInMinutes(
                              member.session.startTime,
                              member.timeOfArrival
                            )}{" "}
                            mins
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          </div>

          {/*sessions section*/}
          <div className="p-4 flex flex-col gap-2">
            <p className="text-lg font-semibold text-white">
              Active and Upcoming Sessions
            </p>
            <p className="text-sm text-gray-400">
              {activeSessions.length} sessions currently running or scheduled
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              {activeSessions.slice(0, 4).map((session) => (
                <SessionCard
                  sessionName={session.name}
                  department={session.department ?? "Department not specified"}
                  location={session.location ?? "Location not specified"}
                  startTime={session.startTime}
                  endTime={session.endTime}
                  expectedMembersCount={session.expectedMembersCount ?? 0}
                  actualMembersCount={session.actualMembersCount ?? 0}
                  status={session.status}
                  creatorName={session.creator.name ?? "No creator found"}
                  type={session.type}
                  category={session.category ?? "No category specified"}
                ></SessionCard>
              ))}
            </div>
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

type SessionCardProps = {
  sessionName: string;
  department: string;
  location: string;
  startTime: Date;
  endTime: Date;
  expectedMembersCount: number;
  actualMembersCount: number;
  status: "active" | "scheduled" | "completed";
  creatorName: string;
  type: "check-in" | "check-out";
  category: string;
};

const SessionCard: React.FC<SessionCardProps> = (props) => {
  const rate =
    ((props.actualMembersCount ?? 0) / (props.expectedMembersCount ?? 1)) * 100;

  const statusStyle =
    props.status === "active"
      ? "text-green-400 bg-green-500/10"
      : props.status === "scheduled"
      ? "text-yellow-400 bg-yellow-500/10"
      : "text-gray-400 bg-gray-500/10";

  return (
    <Card className="bg-slate-900/40 backdrop-blur border border-gray-800/40 rounded-xl p-5 hover:scale-[1.02] transition duration-300 hover:border-solid hover:border-accent">
      <div className="flex flex-col gap-4">
        {/* Top row */}
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-purple-400 bg-purple-500/10 px-2 py-1 rounded-md">
            {props.category}
          </span>
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-md ${statusStyle}`}
          >
            {props.status}
          </span>
        </div>

        {/* Title */}
        <p className="text-white font-semibold text-lg truncate">
          {props.sessionName}
        </p>

        {/* Stats */}
        <div className="flex flex-col gap-2 text-sm">
          <RowStats icon={<LocateIcon size={14} />} value={props.location} />
          <RowStats
            icon={<Clock size={14} />}
            value={`${props.startTime.toLocaleTimeString()} - ${props.endTime.toLocaleTimeString()}`}
          />
          <RowStats
            icon={<PersonStanding size={14} />}
            value={`${props.actualMembersCount} / ${props.expectedMembersCount} members`}
          />
          <p className="text-xs text-gray-500">
            Created by{" "}
            <span className="text-gray-300">{props.creatorName}</span>
          </p>
        </div>

        {/* Progress */}
        <div className="flex justify-between items-center text-xs text-gray-400 mt-2">
          <span>Attendance</span>
          <span className="text-white font-medium">{rate.toFixed(1)}%</span>
        </div>

        <Box>
          <Progress value={rate} />
        </Box>
      </div>
    </Card>
  );
};

type StatsProps = {
  icon: React.ReactNode;
  value: number | string;
};
const RowStats: React.FC<StatsProps> = (props) => {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="text-gray-400 shrink-0">{props.icon}</div>
      <p className="text-gray-300 truncate">{props.value}</p>
    </div>
  );
};
