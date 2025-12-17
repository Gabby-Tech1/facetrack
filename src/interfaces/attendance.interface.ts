import type { MemberInterface } from "./members.interface";
import type { SessionInterface } from "./session.interface";

export interface AttendanceInterface {
  members?: MemberInterface[];
  date: Date;
  timeOfArrival: Date;
  timeOfDeparture?: Date;
  status: "present" | "absent" | "late";
  sessionId?: string;
  memberId?: string;
  id: string;
  session: SessionInterface;

}
