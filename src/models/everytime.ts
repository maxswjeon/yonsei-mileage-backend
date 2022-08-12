import { model, Schema } from "mongoose";

export interface IEverytime {
  id: string;
  code: string;
  name: string;
  professor: string;
  type: string;
  grade: string;
  time: string;
  place: string;
  credit: string;
  popular: string;
  target: string;
  notice: string;
  lectureId: string;
  lectureRate: string;
  misc1: string;
  misc2: string;
  misc3: string;
  misc4: string;
}

const everytimeSchema = new Schema<IEverytime>({
  id: { type: String, required: true },
  code: { type: String, required: true },
  name: { type: String, required: true },
  professor: { type: String, required: true },
  type: { type: String, required: true },
  grade: { type: String, required: true },
  time: { type: String, required: true },
  place: { type: String, required: true },
  credit: { type: String, required: true },
  popular: { type: String, required: true },
  target: { type: String, required: true },
  notice: { type: String, required: true },
  lectureId: { type: String, required: true },
  lectureRate: { type: String, required: true },
  misc1: { type: String, required: true },
  misc2: { type: String, required: true },
  misc3: { type: String, required: true },
  misc4: { type: String, required: true },
});

const Everytime = model<IEverytime>("Everytime", everytimeSchema);

export default Everytime;
