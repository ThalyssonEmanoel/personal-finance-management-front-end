import { redirect } from "next/navigation";
import { auth } from "../../auth.js";
import AuthenticatedHeader from "@/components/AuthenticatedHeader";

export default async function AuthLayout({ children }) {
  const session = await auth();

  if (!session) { 
    redirect("/introduction"); 
  }

  return (
    <div>
      <AuthenticatedHeader />
      <main>
        {children}
      </main>
    </div>
  );
}
