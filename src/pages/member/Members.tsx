import {
  Button,
  Card,
  Heading,
  ScrollArea,
  Select,
  Text,
  TextField,
} from "@radix-ui/themes";
import React, { useState } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import Header from "../../components/dashboard/Header";
import {
  DownloadIcon,
  FilterIcon,
  MailIcon,
  MoreVertical,
  PhoneCallIcon,
  PlusIcon,
  Search,
  Shield,
  User,
} from "lucide-react";
import { AppServices } from "../../services/app-services";
import { members } from "../../data/members";
import { toast } from "sonner";

const Members: React.FC = () => {
  const [role, setRole] = useState<string>("all");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const changeRole = (value: string) => {
    setRole(value);
  };

  const filteredMembers =
    role === "all"
      ? members
      : members.filter((member) => member.user.role === role);

  const services = new AppServices();

  const showSonnerForExport = () => {
    try {
      services.exportFile(filteredMembers);
      toast.success("Members exported successfully.");
    } catch (error) {
      console.error("Error exporting members:", error);
      toast.error("An error occurred while exporting members.");
    }
  };
  return (
    <div className="flex h-screen overflow-hidden">
      {/*SIDEBAR*/}
      <div className="h-screen shrink-0">
        <ScrollArea type="auto" className="h-screen">
          <Sidebar></Sidebar>
        </ScrollArea>
      </div>

      {/*MAIN CONTENT*/}
      <div className="flex-1 overflow-x-hidden">
        <ScrollArea type="auto" className="h-screen">
          <div className="p-4 max-w-full">
            {/*HEADER*/}
            <Header />
            <hr className="my-4 border-gray-700/40" />

            {/* PAGE TITLE */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              {/* Title & Subtitle */}
              <div>
                <Heading className="text-2xl font-semibold text-white">
                  Members
                </Heading>
                <Text className="text-sm text-gray-400">
                  Manage students, staff and administrators.
                </Text>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => showSonnerForExport()} // <-- here
                  style={{ cursor: "pointer" }}
                  variant="soft"
                  radius="large"
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white"
                >
                  <DownloadIcon className="w-4 h-4" />
                  <span className="font-medium">Export</span>
                </Button>

                <Button
                  style={{ cursor: "pointer" }}
                  radius="large"
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span className="font-medium">Add Member</span>
                </Button>
              </div>
            </div>

            {/*SEARCH FIELD*/}
            <Card className="mb-6 bg-slate-900/40 backdrop-blur border border-gray-800/40 rounded-xl p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Left: Search + Filter */}
                <div className="flex gap-3 w-full sm:w-auto">
                  <TextField.Root
                    placeholder="Search by name, email or ID"
                    className="w-full sm:w-65"
                  >
                    <TextField.Slot>
                      <Search className="w-4 h-4 text-gray-500" />
                    </TextField.Slot>
                  </TextField.Root>

                  <Select.Root value={role} onValueChange={changeRole}>
                    <Select.Trigger>
                      <div className="flex gap-2 justify-center items-center">
                        <FilterIcon className="w-4 h-4 text-white" />
                        {role === "all"
                          ? "All Roles"
                          : role === "student"
                          ? "Students"
                          : role === "staff"
                          ? "Staff"
                          : role === "admin"
                          ? "Admins"
                          : "Reps"}
                      </div>
                    </Select.Trigger>

                    <Select.Content>
                      <Select.Item value="all">All Roles</Select.Item>
                      <Select.Item value="student">Students</Select.Item>
                      <Select.Item value="staff">Staff</Select.Item>
                      <Select.Item value="admin">Admins</Select.Item>
                      <Select.Item value="rep">Reps</Select.Item>
                    </Select.Content>
                  </Select.Root>
                </div>

                {/* Right: Count */}
                <p className="text-sm text-gray-400">
                  {members.length} members found
                </p>
              </div>
            </Card>

            {/*MEMBER CARDS*/}
            {filteredMembers.length === 0 ? (
              <Text className="text-gray-500 justify-center items-center flex">
                No members found.
              </Text>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredMembers.map((member, index) => (
                  <MemberCard
                    isHovered={hoveredId === member.id}
                    hoverChange={(isHovered) =>
                      setHoveredId(isHovered ? member.id : null)
                    }
                    key={index}
                    name={member.user.name}
                    email={member.user.email}
                    role={member.user.role}
                    id={member.id}
                    phone={member.guardianPhone ?? "N/A"}
                    department={member.department ?? "General"}
                    profilePicture={member.user.profilePicture ?? ""}
                  />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default Members;

type MemberTypes = {
  name: string;
  profilePicture: string;
  role: string;
  id: string;
  email: string;
  phone: string;
  department: string;
  isHovered?: boolean | undefined;
  hoverChange: (isHovered: boolean) => void;
};

const MemberCard: React.FC<MemberTypes> = (props) => {
  const capitalizedRole =
    props.role.charAt(0).toUpperCase() + props.role.slice(1);
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
            <button className="text-gray-400 hover:text-white cursor-pointer">
              <MoreVertical className="w-4 h-4 text-white" />
            </button>
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
