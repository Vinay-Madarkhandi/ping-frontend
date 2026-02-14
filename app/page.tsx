import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function HomePage() {
  const cookieStore = await cookies();
  const token =
    cookieStore.get("JwtToken") ||
    cookieStore.get("token") ||
    cookieStore.get("jwt") ||
    cookieStore.get("session");

  if (token) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}
