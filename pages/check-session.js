// pages/check-session.js
import { useSession } from "next-auth/react";

export default function CheckSession() {
  const { data: session, status } = useSession();

  if (status === "loading") return <p>Loading session...</p>;
  if (!session) return <p>No session found. Please log in.</p>;

  return (
    <div>
      <h1>Session Info</h1>
      <pre>{JSON.stringify(session, null, 2)}</pre>
    </div>
  );
}
