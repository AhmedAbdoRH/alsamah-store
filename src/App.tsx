import { CartProvider } from './contexts/CartContext';
import { ThemeProvider } from './theme/ThemeContext';
import MaintenancePage from './components/MaintenancePage';

function App() {
  return (
    <ThemeProvider>
      <CartProvider>
        <MaintenancePage />
      </CartProvider>
    </ThemeProvider>
  );
}

export default App;
