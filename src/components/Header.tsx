import { Link } from "react-router-dom";
import { APP_NAME } from "../config";
import Nav from "./Nav";

export default function Header() {
  return (
    <header className="app-header">
      <div className="app-header__inner">
        <p className="app-header__name">
          <Link to="/">{APP_NAME}</Link>
        </p>
        <Nav />
      </div>
    </header>
  );
}
