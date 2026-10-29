import { MILESTONES, PRIZES } from "./data";

export const calcPrize = (correctCount, reason) => {
  if (reason === "win") return PRIZES[PRIZES.length - 1];
  const passedMilestones = MILESTONES.filter((milestone) => milestone <= correctCount);
  if (passedMilestones.length === 0) return 0;
  return PRIZES[passedMilestones[passedMilestones.length - 1] - 1];
};
