import Container from "../layout/Container";
import { ReactNode } from "react";

export default function Section({
  title,
  subtitle,
  action,
  children,
  className = "",
}: {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`py-8 ${className}`}>
      <Container>
        {(title || subtitle || action) && (
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              {title && <h2 className="text-xl font-bold">{title}</h2>}
              {subtitle && <p className="text-gray-600 text-sm">{subtitle}</p>}
            </div>
            {action}
          </div>
        )}
        {children}
      </Container>
    </section>
  );
}
