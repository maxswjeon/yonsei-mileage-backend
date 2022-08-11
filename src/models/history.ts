export type History = {
  rank: number;
  mileage: number;
  isMajor: boolean;
  subjectCount: number;
  isGraduate: boolean;
  isFirst: boolean;
  totalCreditRatio: number;
  lastCreditRatio: number;
  grade: number;
  isEnrolled: boolean;
  note: string;
};

export const fromArray = (array: string[]) => {
  return {
    rank: Number(array[0]),
    mileage: Number(array[1]),
    isMajor: array[2].startsWith("Y"),
    subjectCount: Number(array[3]),
    isGraduate: array[4].startsWith("Y"),
    isFirst: array[5].startsWith("Y"),
    totalCreditRatio: Number(array[6]),
    lastCreditRatio: Number(array[7]),
    grade: Number(array[8]),
    isEnrolled: array[9] == "O",
    note: array[10],
  } as History;
};
