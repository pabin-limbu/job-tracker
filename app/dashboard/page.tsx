import KanBanBoard from "@/components/kanban-board";
import { getSession } from "@/lib/auth/auth";
import connectDb from "@/lib/db";
import { Board } from "@/lib/models";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function getBoard(userId: string) {
  "use cache";
  await connectDb();
  const board = await Board.findOne({
    userId: userId,
    name: "job hunt",
  })
    .populate({
      path: "columns",
      populate: {
        path: "jobApplications",
      },
    })
    .lean();

  // const boardObj = board ? board.toObject() : null;
  // return boardObj;

  console.log("board",board);

  if (!board) return null;
  return JSON.parse(JSON.stringify(board));
}

async function Dashboard() {
  const session = await getSession();
  const board = await getBoard(session?.user.id ?? "");
  if (!session?.user) {
    redirect("sign-in");
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-black">{board.name}</h1>
          <p className="text-gray-600">Track your Job Application</p>
        </div>
        <KanBanBoard board={board} userId={session.user.id} />
      </div>
    </div>
  );
}

async function DashboardPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <Dashboard />
    </Suspense>
  );
}

export default DashboardPage;
