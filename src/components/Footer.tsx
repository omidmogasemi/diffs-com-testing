import { APP_NAME } from "../config";

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="app-footer__inner">{APP_NAME}</div>
    </footer>
  );
}
