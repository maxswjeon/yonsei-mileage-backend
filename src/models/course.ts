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
});

const Course = model<ICourse>("Course", courseSchema);

export default Course;
