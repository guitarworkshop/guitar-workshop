import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import Brands from "./components/Brands.jsx";
import Advisor from "./components/Advisor.jsx";
import Products from "./components/Products.jsx";
import WhyUs from "./components/WhyUs.jsx";
import Wholesale from "./components/Wholesale.jsx";
import Contact from "./components/Contact.jsx";

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Brands />
        <Advisor />
        <Products />
        <WhyUs />
        <Wholesale />
        <Contact />
      </main>
      <footer className="footer">
        <div>
          <strong>吉他工坊</strong>
          <span>Guitar Workshop</span>
        </div>
        <p>© 2026 Guitar Workshop. All Rights Reserved.</p>
      </footer>
    </>
  );
}
