import { Heading, ScrollArea, Text } from "@radix-ui/themes";
import React from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import Header from "../../components/dashboard/Header";

const Members: React.FC = () => {
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
            <div className="mb-6">
              <Heading>Members</Heading>
              <Text className="text-gray-500">
                Manage students, staff and administrators.
              </Text>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default Members;
