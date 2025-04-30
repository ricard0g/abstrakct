import {Await, useRouteLoaderData} from '@remix-run/react';
import {type IndexLoader} from '~/routes/($locale)._index';
import ProductGrid from './ProductGrid';
import {Suspense} from 'react';

export default function SimpleExperience() {
  const data = useRouteLoaderData<Awaited<ReturnType<IndexLoader>>>(
    'routes/($locale)._index',
  );
  const products = data?.products;

  return (
    <>
      <section>
        <Suspense fallback={<div className="text-black">Loading...</div>}>
          <Await resolve={products}>
            {products && <ProductGrid products={products} />}
          </Await>
        </Suspense>
      </section>
    </>
  );
}
