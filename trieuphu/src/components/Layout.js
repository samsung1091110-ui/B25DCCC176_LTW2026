import { Outlet, Link } from "react-router-dom";
import NavBar from "./NavBar";

const Layout = ({ loading, loadError }) => (
  <>
    <header className="site-header">
      <div className="site-header__inner">
        <Link to="/" className="brand">Ai là triệu phú</Link>
        <NavBar />
      </div>
    </header>
    <main className="page-shell">
      {loading ? (
        <p className="notice" role="status">Đang tải câu hỏi...</p>
      ) : loadError ? (
        <p className="notice notice--error" role="alert">Không tải được câu hỏi.</p>
      ) : (
        <Outlet />
      )}
    </main>
    <footer className="site-footer">Ai là triệu phú · Lập trình Web</footer>
  </>
);

export default Layout;
