import Container from "@/components/layout/Container";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { Link, useParams } from "react-router-dom";

export default function OrderSuccess() {
  const { id } = useParams();
  return (
    <Container className="py-12">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Order Success" }]} />
      <div className="mt-6 card-soft p-6 text-center">
        <h1 className="text-2xl font-bold">Thank you! 🎉</h1>
        <p className="mt-2 text-gray-700">Your order was placed successfully.</p>
        <div className="mt-3 text-sm text-gray-600">Reference: <b>{id}</b></div>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/shop" className="btn-outline rounded-xl px-5 py-2.5">Continue Shopping</Link>
          <Link to="/track-order" className="btn-primary rounded-xl px-5 py-2.5">Track Order</Link>
        </div>
      </div>
    </Container>
  );
}
