import { CartProvider } from './contexts/CartContext';
import { ThemeProvider } from './theme/ThemeContext';
import Header from './components/Header';
import Hero from './components/Hero';
import Products from './components/Products';
import Services from './components/Services';
import Footer from './components/Footer';
import Testimonials from './components/Testimonials';
import BannerStrip from './components/BannerStrip';
import WhatsAppButton from './components/WhatsAppButton';

function App() {
  return (
    <ThemeProvider>
      <CartProvider>
        <Header />
        <Hero />
        <BannerStrip />
        <Products />
        <Services />
        <Testimonials />
        <Footer />
        <WhatsAppButton />
      </CartProvider>
    </ThemeProvider>
  );
}

export default App;
