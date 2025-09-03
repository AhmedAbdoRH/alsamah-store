import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Sparkles, ShoppingCart, Check } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import type { ProductSize } from '../types/database';

interface ProductCardProps {
  title: string;
  description: string;
  imageUrl: string;
  price?: number | null; // Make price optional and number type
  salePrice?: number | null; // Make salePrice optional and number type
  id: string | number;
  has_multiple_sizes?: boolean;
  sizes?: ProductSize[];
}

// Define the light gold color using the hex code from the Hero component
const lightGold = '#FFD700'; // This is standard gold color

export default function ProductCard({ title, description, imageUrl, price, salePrice, id, has_multiple_sizes, sizes }: ProductCardProps) {

  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const { displayPrice, displaySalePrice } = useMemo(() => {
    if (has_multiple_sizes && sizes && sizes.length > 0) {
      const validPrices = sizes.map(s => s.price).filter(p => p !== null && p !== undefined) as number[];
      const validSalePrices = sizes.map(s => s.sale_price).filter(p => p !== null && p !== undefined) as number[];

      const minPrice = validPrices.length > 0 ? Math.min(...validPrices) : null;
      const minSalePrice = validSalePrices.length > 0 ? Math.min(...validSalePrices) : null;

      if (minSalePrice !== null && minSalePrice > 0) {
        return { displayPrice: minPrice, displaySalePrice: minSalePrice };
      }
      
      return { displayPrice: minPrice, displaySalePrice: null };
    }

    return { displayPrice: price, displaySalePrice: salePrice };
  }, [has_multiple_sizes, sizes, price, salePrice]);

  console.log('ProductCard Debug - title:', title, 'has_multiple_sizes:', has_multiple_sizes, 'sizes:', sizes, 'price:', price, 'salePrice:', salePrice, 'displayPrice:', displayPrice, 'displaySalePrice:', displaySalePrice);

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const productUrl = `${window.location.origin}/product/${id}`;
    const message = `استفسار عن المنتج: ${title}\nرابط المنتج: ${productUrl}`;
    window.open(`https://wa.me/201027381559?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsAdding(true);
    
    addToCart({
      id,
      title,
      price: (displaySalePrice || displayPrice || 0).toString(), // Use calculated display price as string
      numericPrice: parseFloat((displaySalePrice || displayPrice || 0).toString()), // Convert to number for numericPrice
      imageUrl,
    });
    
    setIsAdded(true);
    
    setTimeout(() => {
      setIsAdding(false);
      setTimeout(() => setIsAdded(false), 2000);
    }, 1000);
  };

  return (
    <div className="group relative bg-secondary/5 backdrop-blur-md rounded-xl border border-secondary/20 overflow-hidden transition-all duration-150 hover:scale-105 hover:bg-secondary/10">
      <Link to={`/product/${id}`} className="block">
        <div className="relative aspect-[4/3] w-full">
          <img
            src={imageUrl || '/placeholder-product.jpg'}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-product.jpg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
        </div>
        <div className="p-6">
          <h3 className="text-xl font-bold mb-2 text-secondary flex items-center gap-2">
            {title}
            <Sparkles className={`h-4 w-4 text-[${lightGold}]`} />
          </h3>
          <p className="text-secondary/70 mb-4">
            {description.split(/\r?\n/)[0]}
          </p>
        </div>
      </Link>
      
      <div className="px-6 pb-6 pt-0">
        <div className="flex justify-between items-center">
          <div className="flex flex-col items-end">
            {displaySalePrice !== null ? (
              <>
                <span className={`font-bold text-lg text-[${lightGold}]`}>{displaySalePrice} ج</span>
                {displayPrice !== null && (
                  <span className="text-sm text-gray-400 line-through">{displayPrice} ج</span>
                )}
              </>
            ) : displayPrice !== null ? (
              <span className={`font-bold text-lg text-[${lightGold}]`}>{displayPrice} ج</span>
            ) : (
              <span className="text-sm text-gray-400">السعر غير متاح</span>
            )}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleAddToCart}
              disabled={isAdding || isAdded}
              className={`flex items-center justify-center p-2 rounded-lg transition-all duration-300 ${ 
                isAdded 
                  ? 'bg-green-500 text-white' 
                  : `bg-[${lightGold}]/90 hover:bg-[${lightGold}] text-secondary`
              } ${isAdding ? 'opacity-75' : ''}`}
              title={isAdded ? 'تمت الإضافة' : 'أضف إلى السلة'}
            >
              {isAdding ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : isAdded ? (
                <Check className="h-5 w-5" />
              ) : (
                <ShoppingCart className="h-5 w-5" />
              )}
            </button>
            
            <button
              onClick={handleContactClick}
              className={`bg-[${lightGold}]/90 hover:bg-yellow-500 text-secondary px-4 py-2 rounded-lg transition-colors duration-300 flex items-center gap-2 backdrop-blur-sm`}
            >
              <MessageCircle className="h-5 w-5" />
              <span className="hidden sm:inline">اطلب الآن</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}