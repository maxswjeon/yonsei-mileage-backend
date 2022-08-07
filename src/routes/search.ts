import { Request, Response } from "express";
import Course from "../models/course";

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

const searchLectures = async (req: Request, res: Response) => {
  const { query } = req.query;

  if (typeof query !== "string") {
    return res.status(400).json({
      error: "Query must be a string",
    });
  }

  const courses = await Course.find({
    $and: [
      {
        $or: [
          { KNA: { $regex: new RegExp(escapeRegExp(query)), $options: "i" } },
          { EKNA: { $regex: new RegExp(escapeRegExp(query)), $options: "i" } },
        ],
      },
      { HYHG: "20221" },
    ],
  });

  res.send(courses);
};

export default searchLectures;
