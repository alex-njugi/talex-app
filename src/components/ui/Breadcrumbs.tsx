import { Link } from "react-router-dom";

export default function Breadcrumbs({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav className="text-sm text-gray-600">
      {items.map((it, i) => (
        <span key={i}>
          {it.href ? <Link to={it.href} className="text-brand hover:underline">{it.label}</Link> : <span>{it.label}</span>}
          {i < items.length - 1 && <span className="mx-2 text-gray-400">/</span>}
        </span>
      ))}
    </nav>
  );
}
