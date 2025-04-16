import { auth } from "@/app/lib/auth"
import { handleAuth } from "../../actions/handle-auth"
import { redirect } from "next/navigation"

export default async function Dashboard() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold">Protected Dashboard</h1>

      {session?.user?.email && (
        <>
          <p>{session?.user?.email}</p>

          <form action={handleAuth}>
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md cursor-pointer">Signout</button>
          </form>
        </>
      )}
    </div>
  )
}

