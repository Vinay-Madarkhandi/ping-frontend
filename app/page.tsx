import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("JwtToken");

  if (token) {
    redirect("/monitors");
  } else {
    redirect("/signin");
  }
}
