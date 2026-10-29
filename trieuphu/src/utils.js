import { MILESTONES, PRIZES } from "./data";

export const calcPrize = (correctCount, reason) => {
  if (reason === "win") return PRIZES[PRIZES.length - 1];
  if (reason === "stop") {
    return correctCount > 0 ? PRIZES[correctCount - 1] : 0;
  }

  const passedMilestones = MILESTONES.filter((milestone) => milestone <= correctCount);
  if (passedMilestones.length === 0) return 0;
  return PRIZES[passedMilestones[passedMilestones.length - 1] - 1];
};

export const makeAudiencePercentages = (correctAnswer, hiddenAnswers = []) => {
  const percentages = [0, 0, 0, 0];
  const visibleWrongAnswers = [0, 1, 2, 3].filter(
    (answerIndex) => answerIndex !== correctAnswer && !hiddenAnswers.includes(answerIndex)
  );

  const minimumCorrectShare = visibleWrongAnswers.length === 1 ? 51 : 40;
  const correctShare =
    Math.floor(Math.random() * (70 - minimumCorrectShare + 1)) + minimumCorrectShare;
  percentages[correctAnswer] = correctShare;

  let remaining = 100 - correctShare;
  visibleWrongAnswers.forEach((answerIndex, index) => {
    if (index === visibleWrongAnswers.length - 1) {
      percentages[answerIndex] = remaining;
      return;
    }

    const slotsLeft = visibleWrongAnswers.length - index - 1;
    const perAnswerLimit = correctShare - 1;
    const minimumShare = Math.max(0, remaining - slotsLeft * perAnswerLimit);
    const maximumShare = Math.min(perAnswerLimit, remaining);
    const share =
      Math.floor(Math.random() * (maximumShare - minimumShare + 1)) + minimumShare;
    percentages[answerIndex] = share;
    remaining -= share;
  });

  return percentages;
};

export const pickTwoWrongAnswers = (correctAnswer) => {
  const wrongAnswers = [0, 1, 2, 3].filter((answerIndex) => answerIndex !== correctAnswer);
  for (let index = wrongAnswers.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [wrongAnswers[index], wrongAnswers[swapIndex]] = [
      wrongAnswers[swapIndex],
      wrongAnswers[index],
    ];
  }
  return wrongAnswers.slice(0, 2);
};
