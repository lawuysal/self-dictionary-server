import { CronJob } from "cron";
import { getAverageNoteIntensity } from "./cronFunctions";

const getAverageIntensityOfUser = new CronJob(
  "*/5 * * * * *",
  function () {
    getAverageNoteIntensity();
  },
  null,
);

export const cronJobs = {
  getAverageIntensityOfUser,
};
