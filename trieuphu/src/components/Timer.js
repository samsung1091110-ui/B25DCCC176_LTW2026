const Timer = ({ seconds }) => (
  <div className={`timer${seconds <= 10 ? " timer--urgent" : ""}`} role="timer" aria-live="off">
    <span className="timer__label">Còn</span>
    <strong>{seconds}</strong>
    <span>giây</span>
  </div>
);

export default Timer;
