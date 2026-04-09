import connectDb from "./db";
import { Board, Column } from "./models";

const DEFAULT_COLUMNS = [
  { name: "Wish List", order: 0 },
  { name: "Applied", order: 1 },
  { name: "Interviewing", order: 2 },
  { name: "Offer", order: 3 },
  { name: "Rejected", order: 4 },
];

export async function initializeUserBoard(userId: string) {
  try {
    await connectDb();

    //check if board already exist.
    const existingBoard = await Board.findOne({
      userId: userId,
      name: "job hunt",
    });
    if (existingBoard) {
      return existingBoard;
    }

    // Create the board.
    const board = await Board.create({
      name: "job hunt",
      userId,
      columns: [],
    });

    //Create default Column.
    const columns = await Promise.all(
      DEFAULT_COLUMNS.map((col) =>
        Column.create({
          name: col.name,
          order: col.order,
          boardId: board._id,
          jobApplications: [],
        }),
      ),
    );

    //update the board with new column id.
    board.columns = columns.map((col) => col._id);
    await board.save();

    return board;

    
  } catch (error) {
    throw error;
  }
}
