// Terms of service. Facebook asks for this URL alongside the privacy policy
// when an app goes live, and it is worth having for a real store regardless.
import LegalLayout, { Section } from "../components/LegalLayout";

export default function Terms() {
  return (
    <LegalLayout title="Terms & Conditions" updated="29 August 2026">
      <Section title="Using this store">
        <p>
          By placing an order on KeyCartX you agree to these terms. If you do not agree with them,
          please do not use the store.
        </p>
      </Section>

      <Section title="Your account">
        <p>
          You are responsible for keeping your account details accurate and your sign-in secure.
          Tell us at once if you think someone else has access to your account. We may suspend an
          account that is being used fraudulently or to abuse the store.
        </p>
      </Section>

      <Section title="Products and prices">
        <p>
          We describe products as accurately as we can, but photographs and screens vary, so exact
          colour and finish may differ slightly. Prices are shown in Indian Rupees and include
          applicable taxes. Prices and availability can change without notice, and we may correct
          obvious pricing errors before dispatching an order.
        </p>
      </Section>

      <Section title="Orders">
        <p>
          Your order is an offer to buy. It is accepted when we confirm it. We may decline an order
          if the item is out of stock, the delivery address is outside the area we serve, or we
          suspect fraud. If we cannot fulfil an order you have already paid for, you get a full
          refund.
        </p>
      </Section>

      <Section title="Payment">
        <p>
          Orders are currently accepted as Cash on Delivery: you pay the delivery partner when the
          order arrives. Where online payment is offered, it is handled by the payment provider and
          we do not receive or store your card or UPI details.
        </p>
      </Section>

      <Section title="Delivery">
        <p>
          We deliver across India. Delivery timelines shown on the site are estimates and are not
          guaranteed, since they depend on the courier and your location. Please give a complete
          address and a reachable phone number - orders returned because they could not be delivered
          may not be re-shipped free of charge.
        </p>
      </Section>

      <Section title="Returns and replacement">
        <p>
          Items can be returned or exchanged within 7 days of delivery if they are unused, in their
          original condition and packaging, with tags intact. Contact us with your order number to
          start a return. Damaged or wrong items are replaced or refunded
          in full; please report them within 48 hours of delivery with photographs. Refunds are
          issued once the returned item reaches us.
        </p>
      </Section>

      <Section title="Reviews you post">
        <p>
          Reviews should be your own honest experience of the product. We may remove reviews that
          are abusive, misleading, or not about the product.
        </p>
      </Section>

      <Section title="Our content">
        <p>
          The KeyCartX name, the site design, and the product photographs and text on it belong to
          us or our suppliers, and may not be copied or reused for commercial purposes without
          permission.
        </p>
      </Section>

      <Section title="Liability">
        <p>
          We are responsible for delivering the product you ordered in the condition described. We
          are not liable for losses beyond that which we could not reasonably have foreseen. Nothing
          here limits any right you have under Indian consumer law.
        </p>
      </Section>

      <Section title="Governing law">
        <p>
          These terms are governed by the laws of India, and disputes fall to the courts of Kerala.
        </p>
      </Section>

      <Section title="Changes">
        <p>
          We may update these terms; the date at the top of this page shows when they last changed.
          The terms that apply to your order are the ones in force when you placed it.
        </p>
      </Section>
    </LegalLayout>
  );
}
