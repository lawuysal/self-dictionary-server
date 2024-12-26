import { RecaptchaEnterpriseServiceClient } from "@google-cloud/recaptcha-enterprise";

const client = new RecaptchaEnterpriseServiceClient();

export async function createCaptchaAssessment({
  projectID = process.env.ORG_PROJECT_ID || "",
  recaptchaKey,
  token,
  recaptchaAction = "signup",
}: {
  projectID?: string;
  recaptchaKey?: string;
  token?: string;
  recaptchaAction?: string;
}) {
  const projectPath = client.projectPath(projectID);

  // Build the assessment request.
  const request = {
    assessment: {
      event: {
        token: token,
        siteKey: recaptchaKey,
      },
    },
    parent: projectPath,
  };

  const [response] = await client.createAssessment(request);

  // Check if the token is valid.
  if (!response.tokenProperties || !response.tokenProperties.valid) {
    if (!response.tokenProperties) {
      console.log(
        "The CreateAssessment call failed because the token properties are null or undefined",
      );
      return null;
    }
    console.log(
      `The CreateAssessment call failed because the token was: ${response.tokenProperties.invalidReason}`,
    );
    return null;
  }

  // Check if the expected action was executed.
  // The `action` property is set by user client in the grecaptcha.enterprise.execute() method.
  if (response.tokenProperties.action === recaptchaAction) {
    // Get the risk score and the reason(s).
    // For more information on interpreting the assessment, see:
    // https://cloud.google.com/recaptcha-enterprise/docs/interpret-assessment
    console.log(`The reCAPTCHA score is: ${response.riskAnalysis?.score}`);
    response.riskAnalysis?.reasons?.forEach((reason) => {
      console.log(reason);
    });

    return response.riskAnalysis?.score;
  } else {
    console.log(
      "The action attribute in your reCAPTCHA tag does not match the action you are expecting to score",
    );
    return null;
  }
}
