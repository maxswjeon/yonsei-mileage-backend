import { parse } from "csv";
import { Request, Response } from "express";
import fs from "fs";
import { finished } from "stream/promises";
import Course, { ICourse } from "../models/course";
import { fromArray, History } from "../models/history";
import Everytime, { IEverytime } from "./../models/everytime";

const min_value_mileage = (data: History[]) => {
  const min = data
    .filter((history: History) => history.isEnrolled)
    .sort((a, b) => a.mileage - b.mileage)
    .map((d) => d.mileage);

  return min.length > 0 ? min[0] : -1;
};

const min_value_mileage_by_grade = (data: History[]) => {
  const data_grade: number[] = [];
  const grades = [...new Set(data.map((d) => d.grade))];

  for (let i = 0; i < grades.sort()[grades.length - 1]; i++) {
    data_grade[i] = -1;
  }

  for (const grade of grades) {
    data_grade[grade - 1] = min_value_mileage(
      data.filter((d) => d.grade === grade)
    );
  }

  return data_grade;
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

  const everytime = await Everytime.findOne({
    id: course_base.FILE,
  });

  const courses = await Course.find({
    KNA: course_base.KNA,
    PROF: course_base.PROF,
  });

  const data: {
    course: ICourse;
    data: History[];
    min: number;
    min_by_grade: number[];
  }[] = [];

  for (const course of courses) {
    if (course.HYHG === "20222") {
      course.HYHG = "2022-2";
      continue;
    }

    // 계절학기는 마일리지 선택제로 진행되지 않음
    if (["3", "4"].includes(course.HYHG[4])) {
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

    course.HYHG = `${course.HYHG.substring(0, 4)}-${course.HYHG[4]}`;

    data.push({
      course: course,
      data: records,
      min: min_value_mileage(records),
      min_by_grade: min_value_mileage_by_grade(records),
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
    everytime,
    course: course_base,
  });
};

export default getInfo;
