import { LETTERS } from "../data";

const AudienceChart = ({ percentages }) => (
  <section className="audience-chart" aria-label="Kết quả hỏi khán giả">
    <h3>Khán giả dự đoán</h3>
    <div className="audience-chart__rows">
      {percentages.map((percentage, index) => (
        <div className="audience-chart__row" key={LETTERS[index]}>
          <span className="audience-chart__label">{LETTERS[index]}: {percentage}%</span>
          <div
            className="audience-chart__bar"
            role="img"
            aria-label={`${LETTERS[index]}: ${percentage}%`}
          >
            <div className="audience-chart__fill" style={{ width: `${percentage}%` }} />
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default AudienceChart;
