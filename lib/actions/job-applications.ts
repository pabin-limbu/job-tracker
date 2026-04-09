"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "../auth/auth";
import connectDb from "../db";
import { Board, Column, JobApplication } from "../models";

interface JobApplicationData {
  company: string;
  position: string;
  location?: string;
  notes?: string;
  salary?: string;
  jobUrl?: string;
  columnId: string;
  boardId: string;
  tags?: string[];
  description: string;
}
export async function createJobApplication(data: JobApplicationData) {
  const session = await getSession();
  if (!session?.user) {
    return {
      error: "Unauthorized",
    };
  }

  await connectDb();

  const {
    company,
    position,
    location,
    notes,
    salary,
    jobUrl,
    columnId,
    boardId,
    tags,
    description,
  } = data;

  if (!company || !position || !columnId || !boardId) {
    return { error: "Missing required Fields" };
  }

  //Verify Board ownership.
  const board = await Board.findOne({
    _id: boardId,
    userId: session.user.id,
  });

  if (!board) {
    return { error: "board not found" };
  }

  //verify column belongs to board.
  const column = await Column.findOne({
    _id: columnId,
    boardId: boardId,
  });

  if (!column) {
    return { error: "Column not found" };
  }

  //max order means in which number the job application comes in like it comes in third or forth or first.
  const maxOrder = (await JobApplication.findOne({ columnId })
    .sort({ order: -1 })
    .select("order")
    .lean()) as { order: number } | null;

  const jobApplication = await JobApplication.create({
    userId: session.user.id,
    company,
    position,
    location,
    notes,
    salary,
    jobUrl,
    columnId,
    boardId,
    tags: tags || [],
    description,
    status: "applied",
    order: maxOrder ? maxOrder.order + 1 : 0,
  });

  await Column.findByIdAndUpdate(columnId, {
    $push: { jobApplications: jobApplication._id },
  });

  // Convert to a plain object and ensure IDs are strings

  const plainJob = jobApplication.toObject();
  plainJob._id = plainJob._id.toString();

  revalidatePath("/dashboard");
  return { data: JSON.parse(JSON.stringify(plainJob)) };
}

export async function updateJobApplication(
  id: string,
  updates: {
    company?: string;
    position?: string;
    location?: string;
    notes?: string;
    salary?: string;
    jobUrl?: string;
    columnId?: string;
    order?: number;
    tags?: string[];
    description?: string;
  },
) {
  const session = await getSession();

  //check if user is loggedin.
  if (!session?.user) {
    return { error: "unauthorized" };
  }

  //get the jobApplication from database that user wants to update.
  const jobApplication = await JobApplication.findById(id);
  //Check if jobApplication with that Id exist.
  if (!jobApplication) {
    return { error: "Job Application Not Found" };
  }
  //check if userId in jobApplication and current loggedIn user id match or not.
  if (jobApplication.userId !== session.user.id) {
    return { error: "unauthorized user" };
  }

  // Destruct the columnId and order from the updated and keep rest in otherUpdates.
  const { columnId, order, ...otherUpdates } = updates;

  //keep everything from the otherUdates in a varialble updatesToApply. partial means that object might have value of it can be null.
  const updatesToApply: Partial<{
    company: string;
    position: string;
    location: string;
    notes: string;
    salary: string;
    jobUrl: string;
    columnId: string;
    order: number;
    tags: string[];
    description: string;
  }> = otherUpdates;

  //extract the current Column Id from jobApplication that we fetched form the database.
  const currentColumnId = jobApplication.columnId.toString();

  //Extract the column id as new column id from the column id sent by the user in function parameter.
  // This will be the columnId after updating jobApplication.
  const newColumnId = columnId?.toString();

  //Check if this jobApplication is moving to another column.ex: from applied to rejected.
  //Compare if the column id sent by user and column id fetched from database are same or not.
  const isMovingToDifferentColumn =
    newColumnId && newColumnId !== currentColumnId;

  if (isMovingToDifferentColumn) {
    //In database we have Column table and on that table we have jobApplication field which holds the array of jobApplicationId.
    //So find the column with current column id and remove the jobApplicationID from the jobApplication array.
    //So find and remove.
    await Column.findByIdAndUpdate(currentColumnId, {
      $pull: { jobApplications: id },
    });

    //Get all jobApplication that matches the new Column id but exclude newly moved jobApplication whose id is equal to current id passed in function parameter.
    // we exclude the current jobApplication from newly moved column because we have to know how many job already existed ther and
    //in which place/order a newly moved job application has to be placed.
    //We get the jobApplication from the targeted column and sort them in ascending order.
    const jobsInTargetColumn = await JobApplication.find({
      columnId: newColumnId,
      _id: { $ne: id },
    })
      .sort({ order: 1 })
      .lean();

    //define newOrderValue for the newly moved jobApplication.
    let newOrderValue: number;
    if (order !== undefined && order !== null) {
      //if order is 2 make it 2*100 that is 200.
      newOrderValue = order * 100;
      //use slice method to get all jobs after index 2 because we want to keep newly moved job at index to so all jobs,
      //after index 2 has to be shifted.
      //jobs order will be 200,203,204 etc but after all the shifting is completed normalization function will reset or say
      //compound all the jobs order to sequential 1,2,3 order so in the begining it is just the strategy to make reordering,
      //easy.
      //when multiplying by 100 we get the gap in between so when new job are added in between we no need to update other job until
      //and unless the order number colide.
      //Front end is responsible for telling which index the job was landed.
      // we are using GAP_BASED_STRATEGY or SPARSE ORDERING strategy.

      const jobsThatneedToShift = jobsInTargetColumn.slice(order);
      for (const job of jobsThatneedToShift) {
        await jobApplication.findByIdAndUpdate(job._id, {
          $set: { order: job.order + 100 },
        });
      }
    } else {
      if (jobsInTargetColumn.length > 0) {
        const lestJobOrder =
          jobsInTargetColumn[jobsInTargetColumn.length - 1].order || 0;
        newOrderValue = lestJobOrder + 100;
      } else {
        newOrderValue = 0;
      }
    }

    //-------------

    updatesToApply.columnId = newColumnId;
    updatesToApply.order = newOrderValue;

    await Column.findByIdAndUpdate(newColumnId, {
      $push: { jobApplications: id },
    });
  } else if (order !== undefined && order !== null) {
    //If jobApplication is not moving to another column.
    const otherJobsInColumn = await JobApplication.find({
      columnId: currentColumnId,
      _id: { $ne: id },
    })
      .sort({ order: 1 })
      .lean();

    const currentJobOrder = jobApplication.order || 0;

    const currentPositionIndex = otherJobsInColumn.findIndex(
      (job) => job.order > currentJobOrder,
    );

    const oldPositionIndex =
      currentPositionIndex === -1
        ? otherJobsInColumn.length
        : currentPositionIndex;

    const newOrderValue = order * 100;
    if (order < oldPositionIndex) {
      const jobsToshiftDown = otherJobsInColumn.slice(order, oldPositionIndex);

      for (const job of jobsToshiftDown) {
        await JobApplication.findByIdAndUpdate(job._id, {
          $set: { order: job.order + 100 },
        });
      }
    } else if (order > oldPositionIndex) {
      const jobsToShiftUp = otherJobsInColumn.slice(oldPositionIndex, order);

      for (const job of jobsToShiftUp) {
        const newOrder = Math.max(0, job.order - 100);
        await JobApplication.findByIdAndUpdate(job._id, {
          $set: { order: newOrder },
        });
      }
    }

    updatesToApply.order = newOrderValue;
  }

  const updated = await JobApplication.findByIdAndUpdate(id, updatesToApply, {
    new: true,
  });

  return { data: JSON.parse(JSON.stringify(updated)) };
}

export async function deleteJobApplication(id: string) {
  const session = await getSession();
  if (!session?.user) {
    return { error: "unauthorized" };
  }

  const jobApplication = await JobApplication.findById(id);
  if (!jobApplication) {
    return { error: "job Application not found" };
  }

  if (jobApplication.userId !== session.user.id) {
    return { error: "unauthorized" };
  }

  await Column.findByIdAndUpdate(jobApplication.columnId, {
    $pull: { jobApplications: id },
  });

  await JobApplication.deleteOne({ _id: id });

  revalidatePath("/dashboard");

  return { success: true };
}
