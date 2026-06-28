import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import Collections from "./components/Collections.jsx";
import Advisor from "./components/Advisor.jsx";
import ProductGrid from "./components/ProductGrid.jsx";
import About from "./components/About.jsx";
import Contact from "./components/Contact.jsx";

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Collections />
        <Advisor />
        <ProductGrid />
        <About />
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
