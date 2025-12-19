import { AppServices } from "../services/app-services";
import { attendance } from "./attendance";

const appServices = new AppServices();

const group = appServices.groupRecord(attendance);

const chartData = appServices.chartData(group);
export { chartData };
