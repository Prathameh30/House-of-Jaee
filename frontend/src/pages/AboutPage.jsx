// src/pages/AboutPage.jsx
import { FiHeart, FiTarget, FiEye, FiAward, FiUsers } from "react-icons/fi";
import ZariDivider from "../components/common/ZariDivider";
import SectionHeading from "../components/common/SectionHeading";

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="grid md:grid-cols-2 items-center">
        <div className="px-6 md:px-16 py-16 md:py-24">
          <span className="text-gold uppercase text-xs tracking-[0.3em] font-semibold">
            Our Story
          </span>
          <h1 className="font-display text-4xl md:text-5xl text-maroon mt-4 leading-tight">
            Woven With Heritage, <br /> Styled For Today
          </h1>
          <p className="mt-6 text-brown-light leading-relaxed">
            Welcome to House of Jaee, where tradition meets timeless elegance.
            At House of Jaee, we believe every saree tells a beautiful story.
            Our mission is to bring thoughtfully curated sarees that celebrate
            India’s rich textile heritage while embracing modern style and
            effortless grace. From soft cottons and elegant linens to luxurious
            silks and festive weaves, every collection is selected with a focus
            on quality, comfort, and craftsmanship. Whether you’re dressing for
            everyday elegance, festive celebrations, or life’s special moments,
            we strive to offer sarees that make you feel confident, graceful,
            and unique.
          </p>
          <p className="mt-4 text-brown-light leading-relaxed">
            At the heart of House of Jaee is a commitment to authenticity,
            trusted quality, and exceptional customer experience. We work with
            carefully chosen artisans, weavers, and manufacturers to bring you
            collections that blend tradition with contemporary fashion. Thank
            you for being a part of our journey. We look forward to helping you
            create beautiful memories, one saree at a time. House of Jaee
            Elegance Woven with Grace.
          </p>
        </div>
        <div className="h-full">
          <img
            src="/images/hero/about-craft.svg"
            alt="Illustration representing handloom craftsmanship"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      <ZariDivider />

      {/* Mission / Vision / Quality / Craftsmanship */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <SectionHeading eyebrow="What We Stand For" title="Our Values" />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: FiTarget,
              title: "Our Mission",
              desc: "To make authentic, high-quality handloom sarees accessible to every woman, while ensuring fair value reaches the weavers behind them.",
            },
            {
              icon: FiEye,
              title: "Our Vision",
              desc: "To become India's most trusted name in ethnic wear — known equally for craftsmanship, transparency, and customer care.",
            },
            {
              icon: FiAward,
              title: "Commitment to Quality",
              desc: "Every saree passes through multiple quality checks for fabric integrity, dye fastness, and finishing before it reaches your doorstep.",
            },
            {
              icon: FiUsers,
              title: "Handmade Craftsmanship",
              desc: "We work directly with weaver collectives across India, supporting traditional techniques passed down through generations.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-white border border-beige-dark rounded-sm p-6 text-center"
            >
              <div className="w-12 h-12 mx-auto rounded-full bg-maroon/10 flex items-center justify-center mb-4">
                <Icon size={22} className="text-maroon" />
              </div>
              <h3 className="font-display text-lg text-brown mb-2">{title}</h3>
              <p className="text-sm text-brown-light leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Closing statement */}
      <section className="bg-maroon py-16 text-center">
        <FiHeart size={32} className="text-gold mx-auto mb-4" />
        <h2 className="font-display text-2xl md:text-3xl text-cream max-w-2xl mx-auto px-4">
          "A saree is six yards of identity, tradition, and grace — and we're
          honoured to be part of yours."
        </h2>
      </section>
    </div>
  );
}
