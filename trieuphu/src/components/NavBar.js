import { NavLink } from "react-router-dom";

const navClassName = ({ isActive }) =>
  isActive ? "nav-link nav-link--active" : "nav-link";

const NavBar = () => (
  <nav className="main-nav" aria-label="Điều hướng chính">
    <NavLink to="/" end className={navClassName}>Trang chủ</NavLink>
    <NavLink to="/questions" className={navClassName}>Ngân hàng câu hỏi</NavLink>
    <NavLink to="/history" className={navClassName}>Lịch sử</NavLink>
  </nav>
);

export default NavBar;
