import { useCallback, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import AudienceChart from "../components/AudienceChart";
import Lifelines from "../components/Lifelines";
import MoneyLadder from "../components/MoneyLadder";
import QuestionCard from "../components/QuestionCard";
import Timer from "../components/Timer";
import { TIME_PER_QUESTION } from "../data";
import { calcPrize, makeAudiencePercentages, pickTwoWrongAnswers } from "../utils";

const Play = ({ questions, playerName, onGameEnd }) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [status, setStatus] = useState("answering");
  const [pendingReason, setPendingReason] = useState(null);
  const [hiddenAnswers, setHiddenAnswers] = useState([]);
  const [audiencePercentages, setAudiencePercentages] = useState(null);
  const [usedLifelines, setUsedLifelines] = useState({
    fiftyFifty: false,
    audience: false,
  });

  const finishGame = useCallback((reason, totalCorrect) => {
    const finalCorrectCount = totalCorrect === undefined ? correctCount : totalCorrect;
    const prize = calcPrize(finalCorrectCount, reason);
    const result = {
      name: playerName,
      prize,
      correctCount: finalCorrectCount,
      reason,
    };

    onGameEnd(result);
    navigate("/result", { replace: true, state: result });
  }, [correctCount, navigate, onGameEnd, playerName]);

  const question = questions[currentIndex];

  useEffect(() => {
    if (status !== "answering") return undefined;

    const intervalId = window.setInterval(() => {
      setTimeLeft((remaining) => Math.max(0, remaining - 1));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [status]);

  useEffect(() => {
    if (status === "answering" && timeLeft === 0) {
      setPendingReason("timeout");
      setSelectedIndex(null);
      setStatus("locked");
    }
  }, [status, timeLeft]);

  useEffect(() => {
    let timeoutId;

    if (status === "locked") {
      timeoutId = window.setTimeout(() => setStatus("revealed"), 1000);
    } else if (status === "revealed" && question) {
      timeoutId = window.setTimeout(() => {
        if (pendingReason === "timeout") {
          finishGame("timeout", correctCount);
          return;
        }

        if (selectedIndex !== question.answer) {
          finishGame("wrong", correctCount);
          return;
        }

        const nextCorrectCount = correctCount + 1;
        if (nextCorrectCount === questions.length) {
          finishGame("win", nextCorrectCount);
          return;
        }

        setCorrectCount(nextCorrectCount);
        setCurrentIndex((index) => index + 1);
        setTimeLeft(TIME_PER_QUESTION);
        setSelectedIndex(null);
        setPendingReason(null);
        setHiddenAnswers([]);
        setAudiencePercentages(null);
        setStatus("answering");
      }, 2000);
    }

    return () => window.clearTimeout(timeoutId);
  }, [
    correctCount,
    finishGame,
    pendingReason,
    question,
    questions.length,
    selectedIndex,
    status,
  ]);

  useEffect(() => {
    if (!question) return undefined;
    document.title = `Câu ${currentIndex + 1}/15 – ${playerName}`;
    return () => {
      document.title = "Ai là triệu phú";
    };
  }, [currentIndex, playerName, question]);

  const handleAnswer = useCallback((answerIndex) => {
    if (status !== "answering" || hiddenAnswers.includes(answerIndex)) return;
    setSelectedIndex(answerIndex);
    setPendingReason(null);
    setStatus("locked");
  }, [hiddenAnswers, status]);

  useEffect(() => {
    if (status !== "answering") return undefined;

    const handleKey = (event) => {
      const answerIndex = ["a", "b", "c", "d"].indexOf(event.key.toLowerCase());
      if (answerIndex < 0 || hiddenAnswers.includes(answerIndex)) return;
      event.preventDefault();
      handleAnswer(answerIndex);
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleAnswer, hiddenAnswers, status]);

  const useFiftyFifty = () => {
    if (status !== "answering" || usedLifelines.fiftyFifty || !question) return;
    const newlyHiddenAnswers = pickTwoWrongAnswers(question.answer);
    setHiddenAnswers(newlyHiddenAnswers);
    setUsedLifelines((current) => ({ ...current, fiftyFifty: true }));
    if (audiencePercentages) {
      setAudiencePercentages(makeAudiencePercentages(question.answer, newlyHiddenAnswers));
    }
  };

  const useAudience = () => {
    if (status !== "answering" || usedLifelines.audience || !question) return;
    setAudiencePercentages(makeAudiencePercentages(question.answer, hiddenAnswers));
    setUsedLifelines((current) => ({ ...current, audience: true }));
  };

  if (!playerName.trim()) return <Navigate to="/" replace />;
  if (!question) return <p className="notice">Không có câu hỏi để chơi.</p>;

  return (
    <section className="play-page">
      <div className="play-header">
        <div>
          <p className="eyebrow">Trò chơi kiến thức</p>
          <h1>Câu {currentIndex + 1}/15 – {playerName}</h1>
        </div>
        <Timer seconds={timeLeft} />
      </div>

      <div className="play-layout">
        <div className="play-main">
          <QuestionCard
            question={question}
            questionNumber={currentIndex + 1}
            selectedIndex={selectedIndex}
            status={status}
            hiddenAnswers={hiddenAnswers}
            onSelect={handleAnswer}
          />
          <Lifelines
            used={usedLifelines}
            disabled={status !== "answering"}
            onUseFiftyFifty={useFiftyFifty}
            onUseAudience={useAudience}
            onStop={() => finishGame("stop", correctCount)}
          />
          {audiencePercentages && <AudienceChart percentages={audiencePercentages} />}
        </div>
        <MoneyLadder currentQuestionNumber={currentIndex + 1} />
      </div>
    </section>
  );
};

export default Play;
