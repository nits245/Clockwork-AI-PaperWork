import { signOut, fetchUserAttributes } from "aws-amplify/auth";
import { useEffect, useState } from "react";

interface UserAttributes {
  email: string;
  identities?: string;
  picture?: string;
}

export function useFetchUser(): [
  user: UserAttributes | null,
  handleSignOut: () => void,
] {
  const [user, setUser] = useState<UserAttributes | null>(null);

  // Fetch user attributes on component mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Fetch the user attributes (expecting an object with key-value pairs)
        const attributes = await fetchUserAttributes(); // Log this structure to verify

        // Assuming the response is an object with `email` and `identities` fields.
        const email = attributes.email ?? "Unknown";
        const identities = attributes.identities ?? "Unknown";
        const picture = attributes.picture ?? undefined;

        // Set the mapped user attributes in the state
        setUser({
          email,
          identities,
          picture,
        });
      } catch (error) {
        // Silently handle auth errors when Amplify is not configured
        // This is expected behavior when using the app without AWS Cognito
        if (error instanceof Error && error.message.includes('Auth UserPool not configured')) {
          // Use default/mock user when Amplify is not configured
          setUser({
            email: "user@example.com",
            identities: "local_user",
            picture: undefined,
          });
        } else {
          console.error("Error fetching user info:", error);
        }
      }
    };

    fetchUser();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return [user, handleSignOut];
}
