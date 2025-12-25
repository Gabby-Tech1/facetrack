import type React from "react";
import type { AttendanceInterface } from "../../interfaces/attendance.interface";
import {
  AlertTriangle,
  MailIcon,
  MoreVertical,
  PhoneCallIcon,
  Shield,
  User,
  User2Icon,
  Button,
  Card,
  Dialog,
  Popover,
  ScrollArea,
  Select,
  Switch,
  TextField,
} from "../../exports/member.card.exports";

import type { MemberTypes } from "../../interfaces/members.interface";

export const MemberCard: React.FC<MemberTypes> = (props) => {
  const dotButtonTexts = ["View Attendance", "Edit Member", "Remove"];
  const capitalizedRole =
    props.role.charAt(0).toUpperCase() + props.role.slice(1);

  const departments = ["Computer Science", "Mathematics", "Physics", "Biology"];
  const status = ["active", "suspended", "pending"];

  return (
    <Card
      onMouseEnter={() => props.hoverChange(true)}
      onMouseLeave={() => props.hoverChange(false)}
      className="
        bg-slate-900/40 backdrop-blur
        border border-gray-800/40
        rounded-xl p-4
        transition-all duration-300
        group
        hover:border-accent hover:shadow-lg hover:shadow-accent/10
      "
    >
      {/* TOP */}
      <div className="flex">
        <div className="flex items-center gap-4">
          {props.profilePicture ? (
            <img
              src={props.profilePicture}
              alt={props.name}
              className="w-12 h-12 group-hover:border-solid group-hover:border-accent group-hover:transition group-hover:duration-300 rounded-lg object-cover border border-gray-700"
            />
          ) : (
            <User className="w-10 h-10 text-gray-600" />
          )}

          <div className="flex-1 flex flex-col gap-1">
            <div className="flex items-center gap-5">
              <p className="text-white font-semibold">{props.name}</p>
              {(props.role === "admin" ||
                props.role === "staff" ||
                props.role === "rep") && (
                <Shield className="w-4 h-4 text-yellow-500" />
              )}
            </div>
            <div className="flex gap-2 text-xs text-gray-400">
              <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-accent">
                {capitalizedRole}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-accent">
                {props.department}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">ID: {props.id}</p>
          </div>
        </div>

        {/*THREE DOTS FOR MORE OPTIONS */}
        {props.isHovered && (
          <div className="ml-auto">
            <Popover.Root>
              <Popover.Trigger>
                <button className="text-gray-400 hover:text-white cursor-pointer">
                  <MoreVertical className="w-4 h-4 text-white" />
                </button>
              </Popover.Trigger>
              <Popover.Content>
                {/*container for buttons in the popover*/}
                <div className="flex flex-col items-start justify-start gap-1">
                  {dotButtonTexts.map((text, index) =>
                    text === "Edit Member" ? (
                      <Dialog.Root>
                        <Dialog.Trigger>
                          <button
                            key={index}
                            className={`text-white hover:bg-accent text-sm rounded-md cursor-pointer p-1 transform transition duration-150`}
                          >
                            {text}
                          </button>
                        </Dialog.Trigger>

                        {/*content for dialog*/}
                        <Dialog.Content className="max-w-3xl w-full bg-[#0a1321] text-white border border-slate-800/80 shadow-2xl rounded-2xl p-6 space-y-5">
                          <Dialog.Title className="flex items-center gap-3 text-lg font-semibold text-white">
                            {props.profilePicture ? (
                              <img
                                className="w-10 h-10 rounded-full border border-slate-700"
                                src={props.profilePicture ?? ""}
                                alt={`${props.name} profile image`}
                              />
                            ) : (
                              <User2Icon className="w-10 h-10 text-cyan-400" />
                            )}
                            <span>Edit Member</span>
                          </Dialog.Title>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <p className="text-sm text-gray-300">Full Name</p>
                              <TextField.Root
                                value={props.name}
                                className="bg-slate-900/70 border border-slate-700/70 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                              />
                            </div>

                            <div className="space-y-2">
                              <p className="text-sm text-gray-300">Email</p>
                              <TextField.Root
                                value={props.email}
                                className="bg-slate-900/70 border border-slate-700/70 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                              />
                            </div>

                            <div className="space-y-2">
                              <p className="text-sm text-gray-300">Role</p>
                              <Select.Root defaultValue={props.role}>
                                <Select.Trigger className="bg-slate-900/70 border border-slate-700/70 text-white rounded-lg px-3 py-2 justify-between focus:outline-none focus:ring-2 focus:ring-cyan-500">
                                  <div className="flex gap-2 justify-between items-center w-full">
                                    {props.role === "admin"
                                      ? "Admin"
                                      : props.role === "staff"
                                      ? "Staff"
                                      : props.role === "rep"
                                      ? "Rep"
                                      : "Student"}
                                  </div>
                                </Select.Trigger>
                                <Select.Content>
                                  <Select.Item value="student">
                                    Student
                                  </Select.Item>
                                  <Select.Item value="staff">Staff</Select.Item>
                                  <Select.Item value="admin">Admin</Select.Item>
                                  <Select.Item value="rep">Rep</Select.Item>
                                </Select.Content>
                              </Select.Root>
                            </div>

                            <div className="space-y-2">
                              <p className="text-sm text-gray-300">
                                Department
                              </p>
                              <Select.Root defaultValue={props.department}>
                                <Select.Trigger className="bg-slate-900/70 border border-slate-700/70 text-white rounded-lg px-3 py-2 justify-between focus:outline-none focus:ring-2 focus:ring-cyan-500">
                                  <div className="flex gap-2 justify-between items-center w-full">
                                    {props.department.charAt(0).toUpperCase() +
                                      props.department.slice(1)}
                                  </div>
                                </Select.Trigger>
                                <Select.Content>
                                  {departments.map((dept) => (
                                    <Select.Item key={dept} value={dept}>
                                      {dept}
                                    </Select.Item>
                                  ))}
                                </Select.Content>
                              </Select.Root>
                            </div>

                            <div className="space-y-2">
                              <p className="text-sm text-gray-300">
                                Student/Staff ID
                              </p>
                              <TextField.Root
                                value={props.id}
                                className="bg-slate-900/70 border border-slate-700/70 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                              />
                            </div>

                            <div className="space-y-2">
                              <p className="text-sm text-gray-300">Status</p>
                              <Select.Root
                                defaultValue={props.status ?? "active"}
                              >
                                <Select.Trigger className="bg-slate-900/70 border border-slate-700/70 text-white rounded-lg px-3 py-2 justify-between focus:outline-none focus:ring-2 focus:ring-cyan-500">
                                  <div className="flex gap-2 justify-between items-center w-full">
                                    {props.status === "active"
                                      ? "Active"
                                      : props.role === "suspended"
                                      ? "Suspended"
                                      : props.role === "pending"
                                      ? "Pending"
                                      : "Unknown"}
                                  </div>
                                </Select.Trigger>
                                <Select.Content>
                                  {status.map((stat) => (
                                    <Select.Item key={stat} value={stat}>
                                      {stat.charAt(0).toUpperCase() +
                                        stat.slice(1)}
                                    </Select.Item>
                                  ))}
                                </Select.Content>
                              </Select.Root>
                            </div>

                            <div className="space-y-2">
                              <p className="text-sm text-gray-300">
                                Year Group
                              </p>
                              <Select.Root
                                defaultValue={
                                  props.yearGroup?.toString() || "1"
                                }
                              >
                                <Select.Trigger className="bg-slate-900/70 border border-slate-700/70 text-white rounded-lg px-3 py-2 justify-between focus:outline-none focus:ring-2 focus:ring-cyan-500">
                                  <div className="flex gap-2 justify-between items-center w-full">
                                    {props.yearGroup === 1
                                      ? "Year 1"
                                      : props.yearGroup === 2
                                      ? "Year 2"
                                      : props.yearGroup === 3
                                      ? "Year 3"
                                      : props.yearGroup === 4
                                      ? "Year 4"
                                      : props.yearGroup === 5
                                      ? "Year 5"
                                      : "Year 6"}
                                  </div>
                                </Select.Trigger>
                                <Select.Content>
                                  <Select.Item value="1">Year 1</Select.Item>
                                  <Select.Item value="2">Year 2</Select.Item>
                                  <Select.Item value="3">Year 3</Select.Item>
                                  <Select.Item value="4">Year 4</Select.Item>
                                  <Select.Item value="5">Year 5</Select.Item>
                                  <Select.Item value="6">Year 6</Select.Item>
                                </Select.Content>
                              </Select.Root>
                            </div>
                          </div>

                          <Card className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-4">
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <p className="text-sm font-medium text-white">
                                  Minor Status
                                </p>
                                <p className="text-xs text-gray-400">
                                  Member is under 18 years old
                                </p>
                              </div>
                              <Switch
                                onChange={() =>
                                  props.isMinorChange &&
                                  props.isMinorChange(!props.isMinor!)
                                }
                                defaultChecked={props.isMinor}
                                color="teal"
                              />
                            </div>
                          </Card>

                          {props.isMinor && (
                            <Card className="bg-yellow-700/40 border border-amber-700/60 rounded-xl p-4 space-y-3">
                              <p className="text-sm font-semibold text-amber-100">
                                Parent/Guardian Information
                              </p>
                              <div className="space-y-2">
                                <p className="text-sm text-amber-100">
                                  Guardian Name
                                </p>
                                <TextField.Root
                                  value={props.guardianName ?? ""}
                                  className="bg-slate-950/60 border border-amber-700/50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                />
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <p className="text-sm text-amber-100">
                                    Guardian Email
                                  </p>
                                  <TextField.Root
                                    value={props.guardianEmail ?? ""}
                                    className="bg-slate-950/60 border border-amber-700/50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <p className="text-sm text-amber-100">
                                    Guardian Phone
                                  </p>
                                  <TextField.Root
                                    value={props.guardianPhone ?? ""}
                                    className="bg-slate-950/60 border border-amber-700/50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                  />
                                </div>
                              </div>
                            </Card>
                          )}

                          <div className="flex justify-end gap-3 pt-2">
                            <Dialog.Close>
                              <Button
                                style={{
                                  backgroundColor: "red",
                                  cursor: "pointer",
                                }}
                                className="bg-slate-800 text-gray-200 hover:bg-slate-700 px-4 py-2 rounded-lg"
                              >
                                Cancel
                              </Button>
                            </Dialog.Close>

                            <Dialog.Close>
                              <Button
                                style={{ cursor: "pointer" }}
                                className="bg-teal-500 text-white hover:bg-teal-400 px-5 py-2 rounded-lg"
                              >
                                Save Changes
                              </Button>
                            </Dialog.Close>
                          </div>
                        </Dialog.Content>
                      </Dialog.Root>
                    ) : text === "View Attendance" ? (
                      <Dialog.Root>
                        <Dialog.Trigger>
                          <button
                            key={index}
                            className="text-white hover:bg-accent/20 text-sm rounded-md cursor-pointer p-1 transform transition duration-150"
                          >
                            {text}
                          </button>
                        </Dialog.Trigger>
                        <Dialog.Content className="max-w-3xl w-full bg-[#0a1321] text-white border border-slate-800/80 shadow-2xl rounded-2xl p-6 space-y-5">
                          <Dialog.Title className="flex items-center gap-3 text-lg font-semibold">
                            <User2Icon className="w-6 h-6 text-cyan-400" />
                            <span>Attendance Records</span>
                          </Dialog.Title>

                          <Card className="bg-slate-900/60 border border-slate-800/70 rounded-xl p-3">
                            <div className="flex items-center gap-3">
                              {props.profilePicture ? (
                                <img
                                  className="w-10 h-10 rounded-full border border-slate-700"
                                  src={props.profilePicture ?? ""}
                                  alt={`${props.name} profile image`}
                                />
                              ) : (
                                <User2Icon className="w-10 h-10 text-cyan-400" />
                              )}
                              <div className="flex flex-col">
                                <span className="text-sm font-semibold text-white">
                                  {props.name}
                                </span>
                                <span className="text-xs text-gray-300">
                                  {props.email}
                                </span>
                              </div>
                              <div className="ml-auto text-xs text-gray-300">
                                {props.attendanceRecords &&
                                props.attendanceRecords.length > 0
                                  ? `${props.attendanceRecords.length} records`
                                  : "Sample data"}
                              </div>
                            </div>
                          </Card>

                          {(() => {
                            const records =
                              props.attendanceRecords &&
                              props.attendanceRecords.length > 0
                                ? props.attendanceRecords
                                : [];
                            const presentCount = records.filter(
                              (r) => r.status === "present"
                            ).length;
                            const lateCount = records.filter(
                              (r) => r.status === "late"
                            ).length;
                            const absentCount = records.filter(
                              (r) => r.status === "absent"
                            ).length;
                            const totalRecords = records.length || 1;
                            const attendanceRate =
                              totalRecords > 0
                                ? Math.round(
                                    ((presentCount + lateCount) /
                                      totalRecords) *
                                      100
                                  )
                                : 0;

                            return (
                              <Card className="bg-slate-900/50 border border-slate-800/60 rounded-xl p-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                  <div className="space-y-1">
                                    <p className="text-xs text-gray-400">
                                      Total
                                    </p>
                                    <p className="text-lg font-semibold text-white">
                                      {totalRecords}
                                    </p>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-xs text-teal-300">
                                      Present
                                    </p>
                                    <p className="text-lg font-semibold text-teal-300">
                                      {presentCount}
                                    </p>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-xs text-yellow-300">
                                      Late
                                    </p>
                                    <p className="text-lg font-semibold text-yellow-300">
                                      {lateCount}
                                    </p>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-xs text-red-300">
                                      Absent
                                    </p>
                                    <p className="text-lg font-semibold text-red-300">
                                      {absentCount}
                                    </p>
                                  </div>
                                </div>
                                <div className="mt-3 pt-3 border-t border-slate-700/50">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-300">
                                      Attendance Rate
                                    </span>
                                    <span
                                      className={`text-lg font-bold ${
                                        attendanceRate >= 80
                                          ? "text-teal-400"
                                          : attendanceRate >= 60
                                          ? "text-yellow-400"
                                          : "text-red-400"
                                      }`}
                                    >
                                      {attendanceRate}%
                                    </span>
                                  </div>
                                </div>
                              </Card>
                            );
                          })()}

                          <ScrollArea type="auto" className="max-h-[50vh]">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {(props.attendanceRecords &&
                              props.attendanceRecords.length > 0
                                ? props.attendanceRecords
                                : ([
                                    {
                                      id: "sample-a1",
                                      memberId: props.id,
                                      sessionId: "sample-s1",
                                      status: "present",
                                      date: new Date(),
                                      timeOfArrival: new Date(),
                                      timeOfDeparture: new Date(
                                        new Date().getTime() +
                                          2 * 60 * 60 * 1000
                                      ),
                                      session: {
                                        id: "sample-s1",
                                        type: "check-in",
                                        name: "Sample Session",
                                        attendance: [],
                                        startTime: new Date(),
                                        endTime: new Date(
                                          new Date().getTime() +
                                            2 * 60 * 60 * 1000
                                        ),
                                        status: "completed",
                                        creator: {
                                          id: "sample-u",
                                          name: "System",
                                          email: "system@example.com",
                                          role: "admin",
                                        },
                                      },
                                    },
                                  ] as AttendanceInterface[])
                              ).map((rec) => (
                                <Card
                                  key={rec.id}
                                  className="bg-slate-900/50 border border-slate-800/60 rounded-xl p-4"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                      <span className="text-sm font-medium text-white">
                                        {rec.session.name}
                                      </span>
                                      <span className="text-xs text-gray-400">
                                        {new Date(
                                          rec.date
                                        ).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <span
                                      className={`text-xs px-2 py-1 rounded-full ${
                                        rec.status === "present"
                                          ? "bg-teal-700/30 text-teal-300"
                                          : rec.status === "late"
                                          ? "bg-yellow-700/30 text-yellow-300"
                                          : "bg-red-700/30 text-red-300"
                                      }`}
                                    >
                                      {rec.status.charAt(0).toUpperCase() +
                                        rec.status.slice(1)}
                                    </span>
                                  </div>
                                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-300">
                                    <div>
                                      <p className="text-gray-400">Arrival</p>
                                      <p className="font-medium">
                                        {new Date(
                                          rec.timeOfArrival
                                        ).toLocaleTimeString([], {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-gray-400">Departure</p>
                                      <p className="font-medium">
                                        {rec.timeOfDeparture
                                          ? new Date(
                                              rec.timeOfDeparture
                                            ).toLocaleTimeString([], {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            })
                                          : "—"}
                                      </p>
                                    </div>
                                  </div>
                                </Card>
                              ))}
                            </div>
                          </ScrollArea>

                          <div className="flex justify-end pt-2">
                            <Dialog.Close>
                              <Button className="bg-slate-800 text-gray-200 hover:bg-slate-700 px-4 py-2 rounded-lg">
                                Close
                              </Button>
                            </Dialog.Close>
                          </div>
                        </Dialog.Content>
                      </Dialog.Root>
                    ) : text === "Remove" ? (
                      <Dialog.Root>
                        <Dialog.Trigger>
                          <button
                            key={index}
                            className="text-white hover:bg-red-600/20 text-sm rounded-md cursor-pointer p-1 transform transition duration-150"
                          >
                            {text}
                          </button>
                        </Dialog.Trigger>
                        <Dialog.Content className="max-w-xl w-full bg-[#0a1321] text-white border border-slate-800/80 shadow-2xl rounded-2xl p-6 space-y-5">
                          <Dialog.Title className="flex items-center gap-3 text-lg font-semibold">
                            <AlertTriangle className="w-6 h-6 text-red-500" />
                            <span>Remove Member</span>
                          </Dialog.Title>

                          <Card className="bg-slate-900/60 border border-slate-800/70 rounded-xl p-3">
                            <div className="flex items-center gap-3">
                              {props.profilePicture ? (
                                <img
                                  className="w-10 h-10 rounded-full border border-slate-700"
                                  src={props.profilePicture ?? ""}
                                  alt={`${props.name} profile image`}
                                />
                              ) : (
                                <User2Icon className="w-10 h-10 text-cyan-400" />
                              )}
                              <div className="flex flex-col">
                                <span className="text-sm font-semibold text-white">
                                  {props.name}
                                </span>
                                <span className="text-xs text-gray-300">
                                  {props.email}
                                </span>
                              </div>
                            </div>
                          </Card>

                          <div className="space-y-3">
                            <p className="text-sm text-gray-300">
                              Are you sure you want to remove this member? This
                              action will:
                            </p>
                            <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
                              <li>
                                Delete all attendance records for this member
                              </li>
                              <li>Remove them from all sessions</li>
                              <li>Revoke their system access</li>
                            </ul>
                            <p className="text-sm text-red-400 font-medium">
                              This action cannot be undone.
                            </p>
                          </div>

                          <div className="flex justify-end gap-3 pt-2">
                            <Dialog.Close>
                              <Button
                                style={{ cursor: "pointer" }}
                                className="px-4 py-2 rounded-lg border border-teal-500 text-teal-200 hover:bg-teal-600/10 shadow-[0_0_12px_rgba(45,212,191,0.25)]"
                              >
                                Cancel
                              </Button>
                            </Dialog.Close>
                            <Dialog.Close>
                              <Button
                                style={{
                                  backgroundColor: "red",
                                  cursor: "pointer",
                                }}
                                className="px-5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500"
                              >
                                Remove Member
                              </Button>
                            </Dialog.Close>
                          </div>
                        </Dialog.Content>
                      </Dialog.Root>
                    ) : (
                      <Dialog.Root>
                        <Dialog.Trigger>
                          <button
                            key={index}
                            className={`text-white hover:bg-accent text-sm rounded-md cursor-pointer p-1 transform transition duration-150`}
                          >
                            {text}
                          </button>
                        </Dialog.Trigger>
                      </Dialog.Root>
                    )
                  )}
                </div>
              </Popover.Content>
            </Popover.Root>
          </div>
        )}
      </div>

      {/* DIVIDER */}
      <hr className="my-3 border-gray-800/60" />

      {/* Contact */}
      <div className="flex flex-col gap-2 text-sm text-gray-300">
        <div className="flex items-center gap-2">
          <MailIcon className="w-4 h-4 text-gray-400" />
          <span className="truncate">{props.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <PhoneCallIcon className="w-4 h-4 text-gray-400" />
          <span>{props.phone}</span>
        </div>
      </div>
    </Card>
  );
};
