/* eslint-disable @typescript-eslint/no-explicit-any */
import jsPDF from "jspdf";
import "jspdf-autotable";
import type { AttendanceInterface } from "../interfaces/attendance.interface";
import autoTable from "jspdf-autotable";

export class AppServices {
  getDayName(date: string): string | undefined {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return undefined;

    const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return DAYS[parsedDate.getDay()];
  }

  groupRecord(attendance: AttendanceInterface[]) {
    type DayStats = {
      present: number;
      expected: number;
      absent: number;
      late: number;
    };

    const grouped = attendance.reduce<Record<string, DayStats>>(
      (acc, record) => {
        const day: string =
          this.getDayName(record.date.toString()) ?? "Unknown";

        if (!acc[day]) {
          acc[day] = {
            present: 0,
            expected: record.members?.length ?? 100,
            absent: 0,
            late: 0,
          };
        }
        if (record.status === "present") {
          acc[day].present += 1;
        }

        if (record.status === "absent") {
          acc[day].absent += 1;
        }

        if (record.status === "late") {
          acc[day].late += 1;
        }
        return acc;
      },
      {}
    );

    return grouped;
  }

  chartData(
    object: Record<
      string,
      { present: number; expected: number; absent: number; late: number }
    >
  ) {
    const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return DAYS.map((day) => {
      const stats = object[day];

      return {
        day,
        present: stats?.present ?? 0,
        absent: stats?.absent ?? 0,
        late: stats?.late ?? 0,
        expected: stats?.expected ?? 0,
      };
    });
  }

  getDiffInMinutes(startTime: Date, arrivalTime: Date) {
    const diffInMs = startTime.getTime() - arrivalTime.getTime();
    return Math.floor(diffInMs / 60000);
  }

  getEarlyArrivals(arrivalRecords: AttendanceInterface[]) {
    return arrivalRecords
      .filter((record) => {
        const currentMonth = new Date().getMonth();
        if (record.date.getMonth() !== currentMonth) return false;
        if (record.date.getFullYear() !== new Date().getFullYear())
          return false;
        if (record.session.startTime === undefined) return false;
        if (record.timeOfArrival === undefined) return false;
        if (record.members?.length === 0) return false;
        if (record.status !== "present") return false;
        if (!record.members || record.members.length === 0) return false;
        const isEarly = record.timeOfArrival <= record.session.startTime;
        return isEarly;
      })
      .sort((a, b) => a.timeOfArrival.getTime() - b.timeOfArrival.getTime())
      .slice(0, 3);
  }

  exportFile(members: any[]) {
    try {
      const doc = new jsPDF();
      doc.setFontSize(12); //this sets the font size for the document
      doc.text("Members List", 14, 22);

      const tableColumn = [
        "Name",
        "Email",
        "Role",
        "Department",
        "ID",
        "Phone",
        "Attendance Rate",
      ];

      const tableRows: any[] = [];

      members.forEach((member) => {
        const attendanceRecords = member.attendanceRecords || [];
        const presentCount = attendanceRecords.filter(
          (record: any) => record.status === "present"
        ).length;
        const lateCount = attendanceRecords.filter(
          (record: any) => record.status === "late"
        ).length;
        const attendanceRate =
          attendanceRecords.length > 0
            ? (
                ((presentCount + lateCount) / attendanceRecords.length) *
                100
              ).toFixed(2)
            : "0.00";
        const memberData = [
          member.user.name,
          member.user.email,
          member.user.role,
          member.department ?? "General",
          member.id,
          member.guardianPhone ?? "N/A",
          `${attendanceRate}%`,
        ];
        tableRows.push(memberData);
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 30,
      });

      doc.save("Members.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw new Error(error instanceof Error ? error.message : "Unknown error");
    }
  }
}
