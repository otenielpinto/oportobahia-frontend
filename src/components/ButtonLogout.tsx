"use client";

// import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";


export default function ButtonLogout() {
  const router = useRouter();

  async function logout() {
    // await signOut({
    //   redirect: false,
    // });

    router.push("/logout");
  }

  return <Button onClick={logout}>Logout</Button>;
}
