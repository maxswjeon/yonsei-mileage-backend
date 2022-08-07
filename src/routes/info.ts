import { parse } from "csv";
import { Request, Response } from "express";
import fs from "fs";
import { finished } from "stream/promises";
import Course from "../models/course";

// 0 순위
// 1 마일리지
// 2 전공자여부
// 3 신청과목수
// 4 졸업신청
// 5 초수강여부
// 6 총이수학점비율
// 7 직전학기이수학점비율
// 8 학년
// 9 수강여부
// 10 비고
const min_value_mileage = (
  data: any[],
  studentInfo: {
    user_grade: number;
    user_subject: number;
    is_graduate: boolean;
    is_first: boolean;
  }
) => {
  const { user_grade, user_subject, is_graduate, is_first } = studentInfo;

  const min = data
    .filter((item: any) => {
      return (
        item[8] == user_grade &&
        item[3] == user_subject &&
        item[4] == (is_graduate ? "Y" : "N") &&
        item[5] == (is_first ? "Y" : "N") &&
        item[9] == "O"
      );
    })
    .sort((a, b) => Number(a[1]) - Number(b[1]))
    .map((d) => d[1]);

  return min.length > 0 ? min[0] : -1;
};

const getInfo = async (req: Request, res: Response) => {
  const { id, studentInfo, isFirst } = req.body;

  const course = await Course.findById(id);

  if (!course) {
    return res.status(404).json({
      error: "Course not found",
    });
  }

  // grade = grade
  // a1 = total credit
  // a2 = graduate credit
  // subjects = subject count
  // b1 = last semester credit
  // b2 = semester max credit
  // graduate = is a graduate

  const { subjects, grade, graduate } = studentInfo;

  const fileList = await fs.promises.readdir(
    `./data/${course.ocode0}/${course.ocode1}/${course.FILE}`
  );

  const data = [];

  for (const file of fileList) {
    console.log(file);

    if (file === "2022-2.csv") {
      continue;
    }

    const records: any[] = [];
    const parser = fs
      .createReadStream(
        `./data/${course.ocode0}/${course.ocode1}/${course.FILE}/${file}`
      )
      .pipe(parse());
    parser.on("readable", () => {
      let record;
      while ((record = parser.read()) !== null) {
        records.push(record);
      }
    });

    await finished(parser);

    records.shift();

    const min = min_value_mileage(records, {
      user_grade: grade,
      user_subject: subjects,
      is_graduate: graduate,
      is_first: isFirst,
    });

    data.push({
      hyhg: file.split(".")[0],
      min,
      data: records.filter((data) => data[1] == min),
      raw: records,
    });
  }

  return res.status(200).json({
    result: true,
    data,
  });
};

export default getInfo;
