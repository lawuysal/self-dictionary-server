import { CronJob } from "cron";
import { getAverageNoteIntensity } from "./cronFunctions";

const getAverageIntensityOfUser = new CronJob(
  "0 2 1/1 * *",
  function () {
    getAverageNoteIntensity();
  },
  null,
);

export const cronJobs = {
  getAverageIntensityOfUser,
};
