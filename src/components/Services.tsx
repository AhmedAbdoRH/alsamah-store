import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import ServiceCard from './ServiceCard';
import { supabase } from '../lib/supabase';
import type { Service, Category, Subcategory } from '../types/database';
import { motion, AnimatePresence } from 'framer-motion';

const lightGold = '#FFD700';
const brownDark = '#3d2c1d';
const SERVICE_PAGE_SIZE = 18;
const SERVICE_SELECT_FIELDS = `
  id,
  category_id,
  subcategory_id,
  title,
  description,
  image_url,
  gallery,
  price,
  sale_price,
  has_multiple_sizes,
  is_featured,
  is_best_seller,
  created_at
`;

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | 'featured' | 'best_sellers' | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreServices, setHasMoreServices] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFeaturedProducts, setHasFeaturedProducts] = useState(false);
  const [hasBestSellerProducts, setHasBestSellerProducts] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const requestKeyRef = useRef(0);
  const servicesLengthRef = useRef(0);

  const visibleSubcategories = useMemo(
    () => subcategories.filter((subcategory) => subcategory.category_id === openCategoryId),
    [openCategoryId, subcategories]
  );

  useEffect(() => {
    void fetchCategories();
    void fetchSubcategories();
    void fetchSpecialFlags();
  }, []);

  useEffect(() => {
    servicesLengthRef.current = services.length;
  }, [services.length]);

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

  const buildServicesQuery = useCallback(() => {
    let query = supabase
      .from('services')
      .select(SERVICE_SELECT_FIELDS, { count: 'exact' })
      .order('created_at', { ascending: false });

    if (selectedCategory && selectedCategory !== 'featured' && selectedCategory !== 'best_sellers') {
      query = query.eq('category_id', selectedCategory);
    } else if (selectedCategory === 'featured') {
      query = query.eq('is_featured', true);
    } else if (selectedCategory === 'best_sellers') {
      query = query.eq('is_best_seller', true);
    }

    if (selectedSubcategory) {
      query = query.eq('subcategory_id', selectedSubcategory);
    }

    return query;
  }, [selectedCategory, selectedSubcategory]);

  const enrichServicesWithSizes = useCallback(async (servicesData: Service[]) => {
    if (!servicesData.length) {
      return [];
    }

    const serviceIds = servicesData.map((service) => service.id);
    const { data: sizesData, error: sizesError } = await supabase
      .from('product_sizes')
      .select('*')
      .in('service_id', serviceIds);

    if (sizesError) {
      throw sizesError;
    }

    return servicesData.map((service) => ({
      ...service,
      sizes: (sizesData || []).filter((size) => String(size.service_id) === String(service.id)),
    }));
  }, []);

  const fetchSpecialFlags = useCallback(async () => {
    try {
      const [
        { count: featuredCount, error: featuredError },
        { count: bestSellerCount, error: bestSellerError },
      ] = await Promise.all([
        supabase.from('services').select('id', { count: 'exact', head: true }).eq('is_featured', true),
        supabase.from('services').select('id', { count: 'exact', head: true }).eq('is_best_seller', true),
      ]);

      if (featuredError) throw featuredError;
      if (bestSellerError) throw bestSellerError;

      setHasFeaturedProducts((featuredCount || 0) > 0);
      setHasBestSellerProducts((bestSellerCount || 0) > 0);
    } catch (err) {
      console.error('Failed to fetch special product flags', err);
    }
  }, []);

  const fetchServices = useCallback(async (reset = false) => {
    const requestKey = ++requestKeyRef.current;

    try {
      if (reset) {
        setIsLoading(true);
        setServices([]);
      } else {
        setIsLoadingMore(true);
      }

      setError(null);

      const from = reset ? 0 : servicesLengthRef.current;
      const to = from + SERVICE_PAGE_SIZE - 1;
      const { data: servicesData, error: servicesError, count } = await buildServicesQuery().range(from, to);

      if (requestKey !== requestKeyRef.current) {
        return;
      }

      if (servicesError) throw servicesError;
      const servicesWithSizes = await enrichServicesWithSizes((servicesData || []) as Service[]);

      if (requestKey !== requestKeyRef.current) {
        return;
      }

      setServices((previousServices) =>
        reset ? servicesWithSizes : [...previousServices, ...servicesWithSizes]
      );

      const loadedCount = from + servicesWithSizes.length;
      setHasMoreServices(loadedCount < (count || 0));
    } catch (err: any) {
      if (requestKey === requestKeyRef.current) {
        setError(err.message);
      }
    } finally {
      if (requestKey === requestKeyRef.current) {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    }
  }, [buildServicesQuery, enrichServicesWithSizes]);

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

  useEffect(() => {
    void fetchServices(true);
  }, [fetchServices]);

  useEffect(() => {
    const node = loadMoreRef.current;

    if (!node || isLoading || isLoadingMore || !hasMoreServices) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void fetchServices(false);
        }
      },
      { rootMargin: '600px 0px' }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [fetchServices, hasMoreServices, isLoading, isLoadingMore]);

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory(null); // Reset subcategory selection
    setOpenCategoryId(prev => (prev === categoryId ? null : categoryId));
  };

  const handleSubcategoryClick = (subcategoryId: string | null) => {
    setSelectedSubcategory(subcategoryId);
  };

  if (isLoading) {
    return (
      <div className="py-16" style={{backgroundColor: '#2a2a2a'}}>
        <div className="container mx-auto px-4 text-center text-white">
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16" style={{backgroundColor: '#2a2a2a'}}>
        <div className="container mx-auto px-4 text-center text-red-600">
          حدث خطأ أثناء تحميل المنتجات: {error}
        </div>
      </div>
    );
  }

  return (
    <section className="py-16" style={{backgroundColor: '#2a2a2a'}} id="products">
      <motion.div
        className="container mx-auto px-4 bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl shadow-black/40"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.8, delayChildren: 0.3, staggerChildren: 0.2 } },
        }}
      >
        {/* العنوان المحسن للSEO */}
        <motion.div
          className="text-center mb-12"
          variants={{
            hidden: { opacity: 0, y: -30 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <h2 className="text-3xl font-bold mb-4 text-[#FFD700]">
            {selectedSubcategory ? (
              <>
                {subcategories.find(sc => sc.id === selectedSubcategory)?.name} - 
                {categories.find(c => c.id === selectedCategory)?.name}
              </>
            ) : selectedCategory ? (
              categories.find(c => c.id === selectedCategory)?.name || 'منتجاتنا'
            ) : (
              'منتجاتنا'
            )}
          </h2>
          
          {/* SEO-optimized description */}
          <div className="max-w-3xl mx-auto text-white/80 text-lg leading-relaxed">
            {selectedSubcategory ? (
              <p>
                اكتشف مجموعة واسعة من <strong>{subcategories.find(sc => sc.id === selectedSubcategory)?.name}</strong> 
                في قسم <strong>{categories.find(c => c.id === selectedCategory)?.name}</strong> من 
                <strong> معرض السماح للمفروشات</strong>. نقدم أفضل أنواع المفروشات والأثاث المنزلي 
                بأسعار تنافسية وجودة عالية.
              </p>
            ) : selectedCategory ? (
              <p>
                تصفح مجموعة متنوعة من <strong>{categories.find(c => c.id === selectedCategory)?.name}</strong> 
                من <strong>معرض السماح للمفروشات</strong>. أريكة، طاولات، كراسي، غرف نوم، 
                صالونات وأكثر بأسعار مناسبة وجودة مضمونة.
              </p>
            ) : (
              <p>
                مرحباً بكم في <strong>معرض السماح للمفروشات</strong> - وجهتكم الأولى للحصول على 
                <strong> أفضل المراتب والمفروشات والأثاث</strong>. اكتشف مجموعتنا الواسعة من 
                بديل السجاد بأسعار تنافسية وجودة عالية.
              </p>
            )}
          </div>
        </motion.div>

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
            onClick={() => {
              setSelectedCategory(null);
              setSelectedSubcategory(null);
              setOpenCategoryId(null);
            }}
              className={`p-4 rounded-xl transition-all duration-300 ${
                !selectedCategory
                  ? 'bg-green-500 text-black font-bold shadow-md'
                  : 'bg-black/20 text-white hover:bg-black/30 hover:shadow-md'
              }`}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            جميع المنتجات
          </motion.button>

          {/* Featured Products Category */}
          {hasFeaturedProducts && (
            <motion.button
              onClick={() => {
                setSelectedCategory('featured');
                setSelectedSubcategory(null);
                setOpenCategoryId(null);
              }}
              className={`p-4 rounded-xl transition-all duration-300 ${
                selectedCategory === 'featured'
                  ? 'bg-yellow-500 text-black font-bold shadow-md'
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
              onClick={() => {
                setSelectedCategory('best_sellers');
                setSelectedSubcategory(null);
                setOpenCategoryId(null);
              }}
              className={`p-4 rounded-xl transition-all duration-300 ${
                selectedCategory === 'best_sellers'
                  ? 'bg-red-500 text-black font-bold shadow-md'
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
          className="flex flex-wrap gap-4 justify-center mb-8"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
          }}
        >
          <AnimatePresence>
            {categories.map((category) => (
              <motion.button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`p-4 rounded-xl transition-all duration-300 ${
                  category.id === selectedCategory
                    ? 'bg-green-500 text-black font-bold shadow-md'
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

        {/* Subcategories Section */}
        {openCategoryId && (
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-wrap gap-3 justify-center">
              {/* زر الكل */}
              <motion.button
                onClick={() => handleSubcategoryClick(null)}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                  selectedSubcategory === null
                    ? 'bg-gradient-to-r from-green-500 to-yellow-500 text-black shadow-xl'
                    : 'bg-white/10 text-white border-2 border-white/20 hover:bg-white/20 hover:border-white/40 hover:shadow-lg'
                }`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                الكل
              </motion.button>
              
              {/* الأقسام الفرعية */}
              <AnimatePresence>
                {visibleSubcategories.map((subcategory, idx) => (
                    <motion.button
                      key={subcategory.id}
                      onClick={() => handleSubcategoryClick(subcategory.id)}
                      className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                        selectedSubcategory === subcategory.id
                          ? 'bg-gradient-to-r from-green-500 to-yellow-500 text-black shadow-xl'
                          : 'bg-white/10 text-white border-2 border-white/20 hover:bg-white/20 hover:border-white/40 hover:shadow-lg'
                      }`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2, delay: idx * 0.05 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {subcategory.name}
                    </motion.button>
                  ))}
              </AnimatePresence>
            </div>
            
          </motion.div>
        )}

        {/* Products Grid */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
          }}
        >
          <AnimatePresence mode="wait">
            {services.length > 0 ? (
              services.map((service) => (
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
                    price={service.price}
                    salePrice={service.sale_price}
                    has_multiple_sizes={service.has_multiple_sizes}
                    sizes={service.sizes}
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
        {(hasMoreServices || isLoadingMore) && (
          <div ref={loadMoreRef} className="flex justify-center py-8">
            <div className="h-8 w-8 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          </div>
        )}
      </motion.div>
    </section>
  );
}
