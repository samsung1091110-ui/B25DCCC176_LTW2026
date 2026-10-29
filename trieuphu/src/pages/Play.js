import { useCallback, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import MoneyLadder from "../components/MoneyLadder";
import QuestionCard from "../components/QuestionCard";
import Timer from "../components/Timer";
import { TIME_PER_QUESTION } from "../data";
import { calcPrize } from "../utils";

const Play = ({ questions, playerName }) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [status, setStatus] = useState("answering");
  const [pendingReason, setPendingReason] = useState(null);
  const question = questions[currentIndex];

  const finishGame = useCallback((reason, totalCorrect) => {
    const finalCorrectCount = totalCorrect === undefined ? correctCount : totalCorrect;
    const result = {
      name: playerName,
      prize: calcPrize(finalCorrectCount, reason),
      correctCount: finalCorrectCount,
      reason,
    };
    navigate("/result", { replace: true, state: result });
  }, [correctCount, navigate, playerName]);

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
        } else if (selectedIndex !== question.answer) {
          finishGame("wrong", correctCount);
        } else {
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
          setStatus("answering");
        }
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

  const handleAnswer = useCallback((answerIndex) => {
    if (status !== "answering") return;
    setSelectedIndex(answerIndex);
    setPendingReason(null);
    setStatus("locked");
  }, [status]);

  if (!playerName.trim()) return <Navigate to="/" replace />;
  if (!question) return <p className="notice">Không có câu hỏi để chơi.</p>;

  return (
    <section className="play-page">
      <div className="play-header">
        <div>
          <p className="eyebrow">Người chơi: {playerName}</p>
          <h1>Ai là triệu phú</h1>
        </div>
        <Timer seconds={timeLeft} />
      </div>
      <div className="play-layout">
        <QuestionCard
          question={question}
          questionNumber={currentIndex + 1}
          selectedIndex={selectedIndex}
          status={status}
          hiddenAnswers={[]}
          onSelect={handleAnswer}
        />
        <MoneyLadder currentQuestionNumber={currentIndex + 1} />
      </div>
    </section>
  );
};

export default Play;
