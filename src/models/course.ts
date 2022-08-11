import { model, Schema } from "mongoose";

export interface ICourse {
  ocode0: string;
  ocode0_title: string;
  ocode1: string;
  ocode1_title: string;
  KNA: string;
  EKNA: string;
  PROF: string;
  FILE: string;
  HYHG: string;
  POINT: string;
  CUT1: string;
  CUT2: string;
  CUT3: string;
  CUT4: string;
  MAX: string;
  MAXM: string;
  MINM: string;
  AVGM: string;
  CNT: string;
  PART: string;
  TIME: string;
  CLSR: string;
}

const courseSchema = new Schema<ICourse>({
  ocode0: { type: String, required: true },
  ocode0_title: { type: String, required: true },
  ocode1: { type: String, required: true },
  ocode1_title: { type: String, required: true },
  KNA: { type: String, required: true },
  EKNA: { type: String, required: true },
  PROF: { type: String, required: true },
  FILE: { type: String, required: true },
  HYHG: { type: String, required: true },
  POINT: { type: String, required: true },
  CUT1: { type: String, required: true },
  CUT2: { type: String, required: true },
  CUT3: { type: String, required: true },
  CUT4: { type: String, required: true },
  MAX: { type: String, required: true },
  MAXM: { type: String, required: true },
  MINM: { type: String, required: true },
  AVGM: { type: String, required: true },
  CNT: { type: String, required: true },
  PART: { type: String, required: true },
  TIME: { type: String, required: true },
  CLSR: { type: String, required: true },
});

const Course = model<ICourse>("Course", courseSchema);

export default Course;
