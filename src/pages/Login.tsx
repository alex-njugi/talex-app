import Container from "@/components/layout/Container";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

export default function Login() {
  return (
    <Container className="py-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Login" }]} />
      <div className="card-soft p-6 mt-4">
        <div className="font-semibold mb-2">Login</div>
        <input className="input mb-2" placeholder="Email" />
        <input className="input mb-2" placeholder="Password" type="password" />
        <button className="btn-primary rounded-xl px-5 py-2.5">Sign In</button>
      </div>
    </Container>
  );
}
