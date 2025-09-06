import Container from "@/components/layout/Container";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

export default function Register() {
  return (
    <Container className="py-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Register" }]} />
      <div className="card-soft p-6 mt-4">
        <div className="font-semibold mb-2">Create account</div>
        <input className="input mb-2" placeholder="Name" />
        <input className="input mb-2" placeholder="Email" />
        <input className="input mb-2" placeholder="Password" type="password" />
        <button className="btn-primary rounded-xl px-5 py-2.5">Sign Up</button>
      </div>
    </Container>
  );
}
