// Privacy policy. Written against what the app actually does rather than
// from a generic template - Facebook and Google both require a reachable
// policy URL before a login app can go live, and Meta additionally wants a
// data-deletion route, which is the #data-deletion section below.
import LegalLayout, { Section } from "../components/LegalLayout";

export default function Privacy() {
  return (
    <LegalLayout title="Privacy Policy" updated="29 August 2026">
      <Section title="Who we are">
        <p>
          KeyCartX is an online store operated from Kerala, India. This page explains what we
          collect when you use the site, why we collect it, and what you can ask us to do with it.
        </p>
      </Section>

      <Section title="What we collect">
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Account details</strong> — your name and email address. If you sign in with
            Google or Facebook, we receive your name, email address and profile picture from them;
            we never see your Google or Facebook password.
          </li>
          <li>
            <strong>Order details</strong> — delivery address, phone number, and what you ordered.
            We need these to deliver your order.
          </li>
          <li>
            <strong>Activity on the site</strong> — items in your cart, products you recently
            viewed, and any reviews you post.
          </li>
          <li>
            <strong>Cookies</strong> — we set a session cookie so you stay signed in. It is not
            used for advertising or tracking you across other websites.
          </li>
        </ul>
        <p>
          We do not collect or store card or UPI details. Orders are currently taken as Cash on
          Delivery; if online payment is enabled later, it is handled by the payment provider on
          their own systems and your card details never reach ours.
        </p>
      </Section>

      <Section title="Why we use it">
        <p>
          To create and secure your account, take and deliver your orders, show you your order
          history, respond to your questions, and keep the store working. We do not sell your
          personal information, and we do not share it for anyone else&apos;s advertising.
        </p>
      </Section>

      <Section title="Where it is stored">
        <p>
          Account and order data is stored with Supabase, our database and authentication provider.
          The site is hosted on Vercel. Both hold the data on our behalf and under their own
          security terms. We keep order records for as long as we are required to for accounting
          and returns.
        </p>
      </Section>

      <Section title="Who we share it with">
        <p>
          Only where it is needed to run the store: delivery partners get the address and phone
          number for your order, and our hosting and database providers process data on our behalf.
          We also share information where the law requires it.
        </p>
      </Section>

      <Section title="Your choices">
        <p>
          You can view and edit your name, email, phone number and saved addresses from your profile
          at any time. You can ask us for a copy of the data we hold about you, ask us to correct
          it, or ask us to delete it.
        </p>
      </Section>

      <Section title="Deleting your account and data">
        <div id="data-deletion" className="scroll-mt-24">
          <p>To have your account and personal data deleted, either:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              Email{" "}
              <a href="mailto:mynonlineshop@gmail.com" className="underline text-[#111827]">
                mynonlineshop@gmail.com
              </a>{" "}
              from the address on your account with the subject &quot;Delete my account&quot;, or
            </li>
            <li>
              If you signed in with Facebook, remove KeyCartX from{" "}
              <span className="whitespace-nowrap">Settings &rsaquo; Apps and Websites</span> on
              Facebook and then email us as above.
            </li>
          </ul>
          <p>
            We will delete your account, profile, saved addresses, cart and reviews within 30 days
            and confirm by email. Records of completed orders are kept where we are legally required
            to retain them for accounting, with personal details reduced to the minimum needed.
          </p>
        </div>
      </Section>

      <Section title="Children">
        <p>
          The store is not intended for children under 13, and we do not knowingly collect their
          information.
        </p>
      </Section>

      <Section title="Changes">
        <p>
          If this policy changes we will update the date at the top of this page. Significant
          changes will be notified by email to registered customers.
        </p>
      </Section>
    </LegalLayout>
  );
}
