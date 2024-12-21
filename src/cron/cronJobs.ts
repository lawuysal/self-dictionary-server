import { CronJob } from "cron";
import { getAverageNoteIntensity } from "./cronFunctions";

const job = new CronJob(
  "* * * * * *",
  function () {
    console.log("You will see this message every second");
  },
  null,
);

const getAverageIntensityOfUser = new CronJob(
  "*/5 * * * * *",
  function () {
    getAverageNoteIntensity();
  },
  null,
);

export const cronJobs = {
  job,
  getAverageIntensityOfUser,
};
