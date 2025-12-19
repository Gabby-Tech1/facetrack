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

  getEarlyArrivals(arrivalRecords: AttendanceInterface[]) {
    return arrivalRecords
      .filter((record) => {
        if (record.status !== "present") return false;
        if (!record.members || record.members.length === 0) return false;
        return record.timeOfArrival < record.session.startTime;
      })
      .sort((a, b) => a.timeOfArrival.getTime() - b.timeOfArrival.getTime())
      .slice(0, 3);
  }
}
