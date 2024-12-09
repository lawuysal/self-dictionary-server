export type GetSocialPostResponseDto = {
  id: string;
  content: string;
  createdAt: string;
  owner: {
    ownerId: string;
    firstName: string;
    lastName: string;
    photoUrl: string;
    username: string;
  };
  positiveActionCount: number;
  positiveActionsBy: Array<{
    userId: string;
    userFirstName: string;
    userLastName: string;
    userUsername: string;
    userPhotoUrl: string;
    positiveActionAt: string;
  }>;
};
