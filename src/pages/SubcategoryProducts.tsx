import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ServiceCard from '../components/ServiceCard';
import type { Service } from '../types/database';

interface Subcategory {
  id: string;
  name: string;
  description: string | null;
  category_id: string;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
}

const SUBCATEGORY_PAGE_SIZE = 18;
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

export default function SubcategoryProducts() {
  const { subcategoryId } = useParams<{ subcategoryId: string }>();
  const [services, setServices] = useState<Service[]>([]);
  const [subcategory, setSubcategory] = useState<Subcategory | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreServices, setHasMoreServices] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestKeyRef = useRef(0);
  const servicesLengthRef = useRef(0);

  useEffect(() => {
    servicesLengthRef.current = services.length;
  }, [services.length]);

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

  const fetchSubcategoryMeta = useCallback(async () => {
    if (!subcategoryId) {
      return;
    }

    const { data: subcat, error: subcatErr } = await supabase
      .from('subcategories')
      .select('id, name_ar, description_ar, category_id, created_at')
      .eq('id', subcategoryId)
      .single();

    if (subcatErr) {
      throw subcatErr;
    }

    setSubcategory({
      id: subcat.id,
      name: subcat.name_ar,
      description: subcat.description_ar,
      category_id: subcat.category_id,
      created_at: (subcat as any).created_at ?? '',
    } as Subcategory);

    if (!subcat.category_id) {
      setCategory(null);
      return;
    }

    const { data: cat, error: catErr } = await supabase
      .from('categories')
      .select('id, name')
      .eq('id', subcat.category_id)
      .single();

    if (catErr) {
      throw catErr;
    }

    setCategory({ id: cat.id, name: cat.name } as Category);
  }, [subcategoryId]);

  const fetchServices = useCallback(async (reset = false) => {
    if (!subcategoryId) {
      return;
    }

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
      const to = from + SUBCATEGORY_PAGE_SIZE - 1;
      const { data: servicesData, error: servicesError, count } = await supabase
        .from('services')
        .select(SERVICE_SELECT_FIELDS, { count: 'exact' })
        .eq('subcategory_id', subcategoryId)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (requestKey !== requestKeyRef.current) {
        return;
      }

      if (servicesError) {
        throw servicesError;
      }

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
  }, [enrichServicesWithSizes, subcategoryId]);

  useEffect(() => {
    if (!subcategoryId) {
      return;
    }

    void fetchSubcategoryMeta();
    void fetchServices(true);
  }, [fetchServices, fetchSubcategoryMeta, subcategoryId]);

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMoreServices) {
      void fetchServices(false);
    }
  };

  if (isLoading) {
    return (
      <div
        className="min-h-screen pt-24 flex items-center justify-center"
        style={{
          background: '#2a2a2a !important',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="text-xl text-secondary">جاري التحميل...</div>
      </div>
    );
  }

  if (error || !subcategory) {
    return (
      <div
        className="min-h-screen pt-24 flex flex-col items-center justify-center gap-4"
        style={{
          background: '#2a2a2a !important',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="text-xl text-secondary">{error || 'القسم الفرعي غير موجود'}</div>
        <Link
          to="/"
          className="bg-accent text-white px-6 py-2 rounded-lg hover:bg-accent-light transition-colors"
        >
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pt-24"
      style={{
        background: '#2a2a2a !important',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-secondary">
          <Link to="/" className="hover:text-accent transition-colors">الرئيسية</Link>
          {category && (
            <>
              <span className="mx-2">/</span>
              <Link to={`/category/${category.id}`} className="hover:text-accent transition-colors">
                {category.name}
              </Link>
            </>
          )}
          <span className="mx-2">/</span>
          <span className="text-accent">{subcategory.name}</span>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl shadow-black/40">
          <h1 className="text-3xl font-bold mb-12 text-accent">{subcategory.name}</h1>
          {subcategory.description && (
            <p className="text-secondary/70 mb-8">{subcategory.description}</p>
          )}

          {services.length === 0 ? (
            <p className="text-center text-secondary/70 py-8">
              لا توجد منتجات في هذا القسم الفرعي حاليًا
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {services.map((service) => (
                  <ServiceCard
                    key={service.id}
                    id={service.id}
                    title={service.title}
                    description={service.description || ''}
                    imageUrl={service.image_url || ''}
                    price={service.price}
                    salePrice={service.sale_price}
                    has_multiple_sizes={service.has_multiple_sizes}
                    sizes={service.sizes}
                  />
                ))}
              </div>

              {(hasMoreServices || isLoadingMore) && (
                <div className="mt-10 flex justify-center">
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="min-w-[220px] rounded-2xl bg-gradient-to-r from-[#FFD700] to-[#d4af37] px-8 py-4 text-lg font-bold text-black shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isLoadingMore ? 'جاري تحميل المزيد...' : 'تحميل المزيد'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
