import {useRouteLoaderData} from '@remix-run/react';
import {type IndexLoader} from '~/routes/($locale)._index';
import ProductGrid from './ProductGrid';

export default function SimpleExperience() {
  const data = useRouteLoaderData<Awaited<ReturnType<IndexLoader>>>(
    'routes/($locale)._index',
  );
  const products = data?.products;

  return (
    <>
      <section>
        {products && <ProductGrid products={products} />}
      </section>
    </>
  );
}
