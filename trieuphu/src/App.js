const BUILD_TAG = "tp-4186";

import { useEffect, useState } from "react";
import axios from "axios";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import QuestionBank from "./pages/QuestionBank";
import QuestionDetail from "./pages/QuestionDetail";

const App = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

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

  return (
    <div className="app" data-build-tag={BUILD_TAG}>
      <Routes>
        <Route element={<Layout loading={loading} loadError={loadError} />}>
          <Route index element={<Home />} />
          <Route path="play" element={<h2>Màn hình chơi</h2>} />
          <Route path="result" element={<h2>Kết quả lượt chơi</h2>} />
          <Route path="history" element={<h2>Lịch sử</h2>} />
          <Route path="questions" element={<QuestionBank questions={questions} />} />
          <Route path="questions/:id" element={<QuestionDetail questions={questions} />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
