import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="page">
      <h1 className="page__title">Page not found</h1>
      <p className="page__lede">
        That route does not exist. <Link to="/">Go back home</Link>.
      </p>
    </section>
  );
}
