const BUILD_TAG = "tp-4186";

import { useEffect, useState } from "react";
import axios from "axios";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import History from "./pages/History";
import NotFound from "./pages/NotFound";
import Play from "./pages/Play";
import QuestionBank from "./pages/QuestionBank";
import QuestionDetail from "./pages/QuestionDetail";
import Result from "./pages/Result";

const readSavedHistory = () => {
  try {
    const savedHistory = localStorage.getItem("ltw_trieuphu_history");
    const parsedHistory = savedHistory ? JSON.parse(savedHistory) : [];
    return Array.isArray(parsedHistory) ? parsedHistory : [];
  } catch {
    return [];
  }
};

const App = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [history, setHistory] = useState(readSavedHistory);

  useEffect(() => {
    const controller = new AbortController();

    axios
      .get("/data/questions.json", { signal: controller.signal })
      .then((response) => {
        setQuestions(response.data);
        setLoadError(false);
      })
      .catch((error) => {
        if (axios.isCancel(error)) return;
        setLoadError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("ltw_trieuphu_history", JSON.stringify(history));
    } catch {
      // Trò chơi vẫn có thể tiếp tục nếu trình duyệt chặn localStorage.
    }
  }, [history]);

  const saveCompletedGame = (game) => {
    const historyEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: game.name,
      prize: game.prize,
      correctCount: game.correctCount,
      playedAt: new Date().toLocaleString("vi-VN"),
    };
    setHistory((currentHistory) => [historyEntry, ...currentHistory]);
  };

  const clearHistory = () => setHistory([]);

  return (
    <div className="app" data-build-tag={BUILD_TAG}>
      <Routes>
        <Route element={<Layout loading={loading} loadError={loadError} />}>
          <Route
            index
            element={
              <Home
                playerName={playerName}
                setPlayerName={setPlayerName}
                history={history}
              />
            }
          />
          <Route
            path="play"
            element={
              <Play
                questions={questions}
                playerName={playerName}
                onGameEnd={saveCompletedGame}
              />
            }
          />
          <Route path="result" element={<Result />} />
          <Route
            path="history"
            element={<History history={history} onClearHistory={clearHistory} />}
          />
          <Route
            path="questions"
            element={<QuestionBank questions={questions} />}
          />
          <Route
            path="questions/:id"
            element={<QuestionDetail questions={questions} />}
          />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
