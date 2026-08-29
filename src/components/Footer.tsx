import { FaInstagram, FaLinkedinIn, FaTwitter, FaWhatsapp } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-primary text-gray-300">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-10 items-center ">
          <div>
            <h2 className="text-5xl font-extrabold leading-tight text-white mb-4">
              JOIN OUR <br /> FAM KeyCartX
            </h2>
            <p className="mt-4 text-gray-400">
              Premium drops, delivered to your door.
            </p>
          </div>

          <div className="sm:text-right">
            <p className="text-sm uppercase tracking-[0.3em] text-gray-400 mb-2">For Enquiries</p>
            {/* Points at the same working inbox the Navbar support link uses.
                Change to a branded address only once that mailbox exists —
                a dead address here silently loses customer enquiries. */}
            <a
              href="mailto:mynonlineshop@gmail.com"
              className="text-2xl md:text-3xl font-bold text-white hover:text-neutral-300 transition-colors break-all"
            >
              mynonlineshop@gmail.com
            </a>
            <p className="mt-3 text-gray-400 text-sm">We usually reply within 24 hours.</p>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: <FaInstagram />, name: "INSTAGRAM" },
            { icon: <FaLinkedinIn />, name: "LINKEDIN" },
            { icon: <FaTwitter />, name: "TWITTER" },
            { icon: <FaWhatsapp />, name: "WHATSAPP" },
          ].map((s) => (
            <a
              key={s.name}
              href="#"
              className="flex items-center justify-center gap-2 bg-secondary text-[#1f2937] hover:bg-neutral-200 hover:text-[#1f2937] py-3 rounded text-sm font-semibold transition-all"
            >
              {s.icon} {s.name}
            </a>
          ))}
        </div>

        <div className="mt-14 border-t border-white/10 pt-10 grid sm:grid-cols-3 gap-8 text-sm text-gray-400">
          <div>
            <h4 className="font-bold mb-3 text-white">CATEGORIES</h4>
            <ul className="space-y-2">
              <li className="hover:text-white cursor-pointer transition-colors">OVERSIZED T-SHIRTS</li>
              <li className="hover:text-white cursor-pointer transition-colors">NEW ARRIVALS</li>
              <li className="hover:text-white cursor-pointer transition-colors">BEST SELLERS</li>
              <li className="hover:text-white cursor-pointer transition-colors">CLASSIC FIT</li>
              <li className="hover:text-white cursor-pointer transition-colors">CARGOS</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-3 text-white">COMPANY</h4>
            <ul className="space-y-2">
              <li className="hover:text-white cursor-pointer transition-colors">ABOUT US</li>
              <li className="hover:text-white cursor-pointer transition-colors">BLOG</li>
              <li className="hover:text-white cursor-pointer transition-colors">PRIVACY POLICY</li>
              <li className="hover:text-white cursor-pointer transition-colors">TERMS & CONDITIONS</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-3 text-white">CUSTOMERS</h4>
            <ul className="space-y-2">
              <li className="hover:text-white cursor-pointer transition-colors">CONTACT US</li>
              <li className="hover:text-white cursor-pointer transition-colors">FAQS</li>
              <li className="hover:text-white cursor-pointer transition-colors">SHIPPING POLICY</li>
              <li className="hover:text-white cursor-pointer transition-colors">REFUND POLICY</li>
            </ul>
          </div>
        </div>

        <p className="mt-10 text-xs text-gray-500">
          © {new Date().getFullYear()} KeyCartX. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
