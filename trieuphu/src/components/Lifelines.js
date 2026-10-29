const Lifelines = ({ used, disabled, onUseFiftyFifty, onUseAudience, onStop }) => (
  <section className="lifelines" aria-label="Quyền trợ giúp">
    <div>
      <h2 className="section-title">Quyền trợ giúp</h2>
      <div className="lifelines__buttons">
        <button type="button" onClick={onUseFiftyFifty} disabled={disabled || used.fiftyFifty}>
          50:50{used.fiftyFifty ? " · Đã dùng" : ""}
        </button>
        <button type="button" onClick={onUseAudience} disabled={disabled || used.audience}>
          Hỏi khán giả{used.audience ? " · Đã dùng" : ""}
        </button>
        <button type="button" className="button button--quiet" onClick={onStop} disabled={disabled}>
          Dừng cuộc chơi
        </button>
      </div>
    </div>
  </section>
);

export default Lifelines;
