import Container from "@/components/layout/Container";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <Container className="py-16 text-center">
      <h1 className="text-3xl font-bold">404 — Page not found</h1>
      <p className="mt-2 text-gray-600">The page you’re looking for doesn’t exist.</p>
      <div className="mt-4"><Link to="/" className="btn-primary rounded-xl px-5 py-2.5">Go Home</Link></div>
    </Container>
  );
}
