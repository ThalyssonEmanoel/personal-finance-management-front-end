import { redirect } from "next/navigation";
import { auth } from "../../auth.js";

export default async function AuthLayout({ children }) {
  const session = await auth();

  if (!session) { redirect("/introduction"); }

  return <>{children}</>;
}
