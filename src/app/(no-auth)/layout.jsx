import { redirect } from "next/navigation";
import { auth } from "../../auth.js";

export default async function NoAuthLayout({ children }) {
  const session = await auth();

  if (session) {
    redirect("/home");
  }

  return <>{children}</>;
}