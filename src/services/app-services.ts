/* eslint-disable @typescript-eslint/no-explicit-any */
import jsPDF from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";
import type { AttendanceInterface } from "../interfaces/attendance.interface";

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
            expected: 100, // Default expected count
            absent: 0,
            late: 0,
          };
        }
        if (record.status === "PRESENT") {
          acc[day].present += 1;
        }

        if (record.status === "ABSENT") {
          acc[day].absent += 1;
        }

        if (record.status === "LATE") {
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
        if (!record.checkInTime) return false;
        if (record.status !== "PRESENT") return false;
        return true;
      })
      .sort((a, b) => {
        const aTime = a.checkInTime?.getTime() ?? 0;
        const bTime = b.checkInTime?.getTime() ?? 0;
        return aTime - bTime;
      })
      .slice(0, 3);
  }

  exportFile(members: any[]) {
    try {
      const doc = new jsPDF();
      doc.setFontSize(12);
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
          (record: any) => record.status === "present" || record.status === "PRESENT"
        ).length;
        const lateCount = attendanceRecords.filter(
          (record: any) => record.status === "late" || record.status === "LATE"
        ).length;
        const attendanceRate =
          attendanceRecords.length > 0
            ? (
              ((presentCount + lateCount) / attendanceRecords.length) *
              100
            ).toFixed(2)
            : "0.00";
        const memberData = [
          member.user?.name ?? member.name,
          member.user?.email ?? member.email,
          member.user?.role ?? member.role,
          member.department ?? "General",
          member.id,
          member.phone ?? member.guardianPhone ?? "N/A",
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
