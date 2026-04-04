import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ServiceCard from '../components/ServiceCard';
import type { Service, Category } from '../types/database';

interface SubcategoryItem {
  id: string;
  name: string;
}

const CATEGORY_PAGE_SIZE = 18;
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

export default function CategoryProducts() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [services, setServices] = useState<Service[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [subcategories, setSubcategories] = useState<SubcategoryItem[]>([]);
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

  const fetchCategoryMeta = useCallback(async () => {
    if (!categoryId) {
      return;
    }

    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('id, name, description, created_at')
      .eq('id', categoryId)
      .single();

    if (categoryError) {
      throw categoryError;
    }

    setCategory({
      id: categoryData.id,
      name: categoryData.name,
      description: categoryData.description,
      created_at: categoryData.created_at,
    } as Category);

    const { data: subcats, error: subErr } = await supabase
      .from('subcategories')
      .select('id, name_ar')
      .eq('category_id', categoryId)
      .order('name_ar', { ascending: true });

    if (!subErr && subcats) {
      setSubcategories(subcats.map((subcategory: any) => ({ id: subcategory.id, name: subcategory.name_ar })));
      return;
    }

    setSubcategories([]);
  }, [categoryId]);

  const fetchServices = useCallback(async (reset = false) => {
    if (!categoryId) {
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
      const to = from + CATEGORY_PAGE_SIZE - 1;
      const { data: servicesData, error: servicesError, count } = await supabase
        .from('services')
        .select(SERVICE_SELECT_FIELDS, { count: 'exact' })
        .eq('category_id', categoryId)
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
  }, [categoryId, enrichServicesWithSizes]);

  useEffect(() => {
    if (!categoryId) {
      return;
    }

    void fetchCategoryMeta();
    void fetchServices(true);
  }, [categoryId, fetchCategoryMeta, fetchServices]);

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

  if (error || !category) {
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
        <div className="text-xl text-secondary">{error || 'القسم غير موجود'}</div>
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
        <div className="mb-8">
          <Link to="/" className="text-secondary hover:text-accent transition-colors">
            ← العودة للرئيسية
          </Link>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl shadow-black/40">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4 text-accent">{category.name}</h1>

            {subcategories.length > 0 && (
              <div className="mb-6 flex flex-wrap gap-2">
                {subcategories.map((subcategory) => (
                  <Link
                    key={subcategory.id}
                    to={`/subcategory/${subcategory.id}`}
                    className="px-3 py-1.5 text-sm rounded-lg bg-white/20 text-white/90 hover:bg-white/30 hover:text-white transition-all duration-200 border border-white/8 hover:border-white/25"
                  >
                    {subcategory.name}
                  </Link>
                ))}
              </div>
            )}

            {category.description && (
              <p className="text-secondary/70">{category.description}</p>
            )}
          </div>

          {services.length === 0 ? (
            <p className="text-center text-secondary/70 py-8">
              لا توجد منتجات في هذا القسم حاليًا
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
