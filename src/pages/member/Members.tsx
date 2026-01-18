import {
  Button,
  Card,
  Heading,
  ScrollArea,
  Select,
  Text,
  TextField,
  React,
  useState,
  Sidebar,
  Header,
  DownloadIcon,
  FilterIcon,
  PlusIcon,
  Search,
  AppServices,
  members,
  toast,
} from "../../exports/members.exports";

import { MemberCard } from "../../components/members/MemberCard";
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
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-gray-950 px-4 pt-4 pb-2">
          <Header />
          <hr className="mt-4 border-gray-700/40" />
        </div>

        <ScrollArea type="auto" className="flex-1">
          <div className="p-4 pt-2 max-w-full">

            {/* PAGE TITLE */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              {/* TITLE & SUBTITLE*/}
              <div>
                <Heading className="text-2xl font-semibold text-white">
                  Members
                </Heading>
                <Text className="text-sm text-gray-400">
                  Manage students, staff and administrators.
                </Text>
              </div>

              {/* ACTION */}
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
                    isMinor={member.isMinor}
                    id={member.id}
                    phone={member.guardianPhone ?? "N/A"}
                    department={member.department ?? "General"}
                    profilePicture={member.user.profilePicture ?? ""}
                    attendanceRecords={member.attendanceRecords}
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
