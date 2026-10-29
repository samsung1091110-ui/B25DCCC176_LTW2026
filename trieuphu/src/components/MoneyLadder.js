import { MILESTONES, PRIZES, formatMoney } from "../data";

const MoneyLadder = ({ currentQuestionNumber }) => (
  <aside className="money-ladder" aria-label="Thang tiền thưởng">
    <h2 className="section-title">Tiền thưởng</h2>
    <ol className="money-ladder__list">
      {[...PRIZES].reverse().map((prize, index) => {
        const questionNumber = PRIZES.length - index;
        const isMilestone = MILESTONES.includes(questionNumber);
        const isCurrent = currentQuestionNumber === questionNumber;
        const gridColumn = Math.floor((questionNumber - 1) / 5) + 1;
        const gridRow = 5 - ((questionNumber - 1) % 5);
        return (
          <li
            key={questionNumber}
            style={{ gridColumn, gridRow }}
            className={[
              "money-ladder__step",
              isMilestone ? "money-ladder__step--milestone" : "",
              isCurrent ? "money-ladder__step--current" : "",
            ].filter(Boolean).join(" ")}
            aria-current={isCurrent ? "step" : undefined}
          >
            <span>{questionNumber}</span>
            <span>{formatMoney(prize)}</span>
          </li>
        );
      })}
    </ol>
  </aside>
);

export default MoneyLadder;
