import React from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import { Card, Heading, ScrollArea, Text } from "@radix-ui/themes";
import Header from "../../components/dashboard/Header";
import {
  AlarmClockCheck,
  Award,
  AwardIcon,
  Calendar1,
  CircleCheck,
  ClockAlert,
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
          <div className="grid lg:grid-cols-3 gap-10 grid-cols-1 p-4">
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
              <div
                style={{ width: "100%", maxWidth: "1100px", height: "300px" }}
              >
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
          <Card className="w-full p-6 bg-slate-900/40 backdrop-blur border border-gray-800/40 rounded-xl">
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
              {services.getEarlyArrivals(attendance).map((member, index) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition"
                >
                  <div className="flex justify-center items-center gap-5">
                    {index == 0 ? (
                      <TrophyIcon className="text-yellow-400" />
                    ) : index == 1 ? (
                      <Award className="text-gray-400" />
                    ) : index == 2 ? (
                      <AwardIcon className="text-yellow-700" />
                    ) : (
                      <LucideAward className="text-gray-600" />
                    )}
                    <div className="flex items-center gap-3">
                      <img
                        src={member.members?.[0]?.user.profilePicture}
                        alt={member.members?.[0]?.user.name}
                        className="w-9 h-9 rounded-full object-cover"
                      />

                      <div>
                        <p className="text-white text-sm font-medium">
                          {member.members?.[0]?.user.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {member.members?.[0]?.user.email}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`text-sm rounded-2xl items-center justify-center flex w-12 h-6 ${
                        index === 0
                          ? "text-yellow-400 bg-yellow-500/10"
                          : index === 1
                          ? "text-gray-400 bg-gray-500/10"
                          : index === 2
                          ? "text-yellow-700 bg-yellow-500/10"
                          : "text-gray-600 bg-gray-500/10"
                      } font-bold text-lg`}
                    >
                      {index === 0 ? (
                        <div className="flex p-10 justify-center items-center mr-1 text-yellow-400">
                          <Award className="text-yellow-400" size={15} />
                          <p className="text-sm">1st</p>
                        </div>
                      ) : index === 1 ? (
                        <div>
                          <div className="flex p-10 justify-center items-center mr-1 text-gray-400">
                            <Award className="text-gray-400" size={15} />
                            <p className="text-sm">2nd</p>
                          </div>
                        </div>
                      ) : index === 2 ? (
                        <div className="flex p-10 justify-center items-center mr-1 text-yellow-700">
                          <AwardIcon className="text-yellow-700" size={15} />
                          <p className="text-sm">3rd</p>
                        </div>
                      ) : (
                        `${index + 1}th`
                      )}
                    </div>
                  </div>

                  <span className="text-green-400 text-sm font-semibold">
                    +5 Points
                  </span>
                </div>
              ))}
            </div>
          </Card>
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
