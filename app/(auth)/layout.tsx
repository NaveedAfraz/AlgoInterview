import React from "react";
import { isAuthenticated } from "@/lib/actions/auth.action";
import { redirect } from "next/navigation";

async function authLayout({ children }: { children: React.ReactNode }) {
  const isUserAuthenticated = await isAuthenticated();
  if (isUserAuthenticated) {
    return redirect("/");
  }
  return <div className="auth-layout">{children}</div>;
}

export default authLayout;
