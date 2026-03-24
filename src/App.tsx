import { CartProvider } from './contexts/CartContext';
import { ThemeProvider } from './theme/ThemeContext';
import MaintenancePage from './components/MaintenancePage';
import OriginalHomePage from './components/OriginalHomePage';

// Change this to 'true' to show maintenance page, 'false' to show original site
const SHOW_MAINTENANCE = false;

function App() {
  return (
    <ThemeProvider>
      <CartProvider>
        {SHOW_MAINTENANCE ? <MaintenancePage /> : <OriginalHomePage />}
      </CartProvider>
    </ThemeProvider>
  );
}

export default App;
