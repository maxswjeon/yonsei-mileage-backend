import { parse } from "csv";
import { Request, Response } from "express";
import fs from "fs";
import { finished } from "stream/promises";
import Course, { ICourse } from "../models/course";
import { fromArray, History } from "../models/history";

const min_value_mileage = (data: History[]) => {
  const min = data
    .filter((history: History) => history.isEnrolled)
    .sort((a, b) => a.mileage - b.mileage)
    .map((d) => d.mileage);

  return min.length > 0 ? min[0] : -1;
};

const getInfo = async (req: Request, res: Response) => {
  const { id } = req.body;

  let course_base;
  try {
    course_base = await Course.findById(id);
  } catch {
    res.status(500).json({
      result: false,
      message: "Something went wrong",
    });
    return;
  }

  if (!course_base) {
    return res.status(404).json({
      error: "Course not found",
    });
  }

  const courses = await Course.find({
    KNA: course_base.KNA,
    PROF: course_base.PROF,
  });

  const data: { course: ICourse; data: History[]; min: number }[] = [];

  for (const course of courses) {
    if (course.HYHG === "20222") {
      continue;
    }

    const records: History[] = [];
    const parser = fs
      .createReadStream(
        `./data/${course.ocode0}/${course.ocode1}/${
          course.FILE
        }/${course.HYHG.substring(0, 4)}-${course.HYHG[4]}.csv`
      )
      .pipe(parse());

    parser.on("readable", () => {
      let record;
      while ((record = parser.read())) {
        if (record[0] === "순위") {
          continue;
        }
        records.push(fromArray(record));
      }
    });
    await finished(parser);

    data.push({
      course: course,
      data: records,
      min: min_value_mileage(records),
    });
  }

  // grade = grade
  // a1 = total credit
  // a2 = graduate credit
  // subjects = subject count
  // b1 = last semester credit
  // b2 = semester max credit
  // graduate = is a graduate

  // const { subjects, grade, graduate } = studentInfo;

  return res.status(200).json({
    result: true,
    data,
    course: course_base,
  });
};

export default getInfo;
