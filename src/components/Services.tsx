import React, { useEffect, useState, useCallback } from 'react';
import ServiceCard from './ServiceCard';
import { supabase } from '../lib/supabase';
import type { Service, Category, Subcategory } from '../types/database';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const lightGold = '#FFD700';
const brownDark = '#3d2c1d';
const accentColor = '#d99323';

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | 'featured' | 'best_sellers' | null>(null);
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasFeaturedProducts, setHasFeaturedProducts] = useState(false);
  const [hasBestSellerProducts, setHasBestSellerProducts] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchServices();
    fetchSubcategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchServices = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all services with their categories
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          category:categories(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServices(data || []);

      // Check if we have any featured or best seller products
      const hasFeatured = data?.some(service => service.is_featured) || false;
      const hasBestSellers = data?.some(service => service.is_best_seller) || false;
      
      setHasFeaturedProducts(hasFeatured);
      setHasBestSellerProducts(hasBestSellers);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchSubcategories = async () => {
    try {
      const { data, error } = await supabase
        .from('subcategories')
        .select('id, name_ar, description_ar, category_id')
        .order('name_ar');

      if (error) throw error;
      const mapped: Subcategory[] = (data || []).map((sc: any) => ({
        id: sc.id,
        name: sc.name_ar ?? '',
        description: sc.description_ar ?? null,
        category_id: sc.category_id,
      }));
      setSubcategories(mapped);
    } catch (err) {
      console.error('Failed to fetch subcategories', err);
    }
  };

  const filteredServices = useCallback((): Service[] => {
    if (!selectedCategory) return services;
    
    if (selectedCategory === 'featured') {
      return services.filter(service => service.is_featured === true);
    }
    
    if (selectedCategory === 'best_sellers') {
      return services.filter(service => service.is_best_seller === true);
    }
    
    return services.filter(service => service.category_id === selectedCategory);
  }, [selectedCategory, services]);

  if (isLoading) {
    return (
      <div className={`py-16 bg-gradient-to-br from-[${brownDark}] to-black`}>
        <div className="container mx-auto px-4 text-center text-white">
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`py-16 bg-gradient-to-br from-[${brownDark}] to-black`}>
        <div className="container mx-auto px-4 text-center text-red-600">
          حدث خطأ أثناء تحميل العطور: {error}
        </div>
      </div>
    );
  }

  return (
    <section className={`py-16 bg-gradient-to-br from-[${brownDark}] to-black`} id="products">
      <motion.div
        className="container mx-auto px-4 bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl shadow-black/40"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.8, delayChildren: 0.3, staggerChildren: 0.2 } },
        }}
      >
        {/* العنوان */}
        <motion.h2
          className={`text-3xl font-bold text-center mb-12 text-[${lightGold}]`}
           variants={{
            hidden: { opacity: 0, y: -30 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          منتجاتنا
        </motion.h2>
        {/* Special Categories */}
        <motion.div
          className="flex flex-wrap gap-4 justify-center mb-6"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
          }}
        >
          {/* All Products Button */}
          <motion.button
            onClick={() => setSelectedCategory(null)}
            className={`p-4 rounded-xl transition-all duration-300 ${
              !selectedCategory
                ? `bg-[var(--color-secondary,#34C759)] text-black font-bold shadow-md`
                : 'bg-black/20 text-white hover:bg-black/30 hover:shadow-md'
            }`}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            جميع العطور
          </motion.button>

          {/* Featured Products Category */}
          {hasFeaturedProducts && (
            <motion.button
              onClick={() => setSelectedCategory('featured')}
              className={`p-4 rounded-xl transition-all duration-300 ${
                selectedCategory === 'featured'
                  ? `bg-[var(--color-secondary,#FFD700)] text-black font-bold shadow-md`
                  : 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 hover:shadow-md'
              }`}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <span className="text-yellow-400">✨</span> أحدث العروض
              </h3>
            </motion.button>
          )}

          {/* Best Sellers Category */}
          {hasBestSellerProducts && (
            <motion.button
              onClick={() => setSelectedCategory('best_sellers')}
              className={`p-4 rounded-xl transition-all duration-300 ${
                selectedCategory === 'best_sellers'
                  ? `bg-[var(--color-secondary,#FF6B6B)] text-black font-bold shadow-md`
                  : 'bg-red-500/20 text-red-300 hover:bg-red-500/30 hover:shadow-md'
              }`}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <span className="text-red-400">🔥</span> الأكثر مبيعاً
              </h3>
            </motion.button>
          )}
        </motion.div>

        {/* Regular Categories */}
        <motion.div
          className="flex flex-wrap gap-4 justify-center mb-12"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
          }}
        >
          <AnimatePresence>
            {categories.map((category) => (
              <motion.button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category.id);
                  setOpenCategoryId(prev => (prev === category.id ? null : category.id));
                }}
                className={`p-4 rounded-xl transition-all duration-300 ${
                  category.id === selectedCategory
                    ? `bg-[var(--color-secondary,#34C759)] text-black font-bold shadow-md`
                    : 'bg-black/20 text-white hover:bg-black/30 hover:shadow-md'
                }`}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <h3 className="text-lg font-semibold">{category.name}</h3>
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* التصنيفات الفرعية تحت القسم المحدد */}
        {openCategoryId && (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex flex-wrap gap-2 justify-center">
              {subcategories.filter(sc => sc.category_id === openCategoryId).length === 0 ? (
                <span className="text-gray-300 text-sm">لا توجد أقسام فرعية لهذا القسم.</span>
              ) : (
                subcategories
                  .filter(sc => sc.category_id === openCategoryId)
                  .map(sc => (
                    <Link
                      key={sc.id}
                      to={`/subcategory/${sc.id}`}
                      className="px-4 py-2 rounded-full text-base bg-white/70 text-black border border-white/80 shadow-sm hover:bg-white transition-colors"
                    >
                      {sc.name}
                    </Link>
                  ))
              )}
            </div>
          </motion.div>
        )}

        {/* Products Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
          }}
        >
          <AnimatePresence mode="wait">
            {filteredServices().length > 0 ? (
              filteredServices().map((service) => (
                <motion.div
                  key={service.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                    exit: { opacity: 0, y: -20 }
                  }}
                  transition={{ duration: 0.4 }}
                >
                  <ServiceCard
                    id={service.id}
                    title={service.title}
                    description={service.description || ''}
                    imageUrl={service.image_url || ''}
                    price={service.price || ''}
                    salePrice={service.sale_price || null}
                  />
                </motion.div>
              ))
            ) : (
              <motion.div
                key="no-services"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="col-span-full text-center text-white text-xl"
                 transition={{ duration: 0.5 }}
              >
                لا توجد منتجات في هذه الفئة.
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </section>
  );
}