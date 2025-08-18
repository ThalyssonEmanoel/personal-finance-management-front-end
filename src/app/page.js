import { redirect } from "next/navigation";
import { auth } from "../auth.js";

export default async function RootPage() {
  const session = await auth();

  if (session) {
    redirect("/home");
  } else {
    redirect("/introduction");
  }
}
