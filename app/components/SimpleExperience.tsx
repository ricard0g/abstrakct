import {Image, Money} from '@shopify/hydrogen';
import {useRouteLoaderData} from '@remix-run/react';
import {type IndexLoader} from '~/routes/($locale)._index';

export default function SimpleExperience() {
  const data = useRouteLoaderData<Awaited<ReturnType<IndexLoader>>>(
    'routes/($locale)._index',
  );
  const products = data?.products;

  return (
    <>
      <section>{products && <ProductGrid products={products} />}</section>
    </>
  );
}

function aspectRatio(width: number, height: number) {
  return width / height;
}

function ProductGrid({
  products,
}: {
  products: Awaited<ReturnType<IndexLoader>>['products'];
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 auto-rows-auto gap-4 md:gap-10 place-items-center">
      {products.map((product: any, i: number) => {
        const isWideImage =
          aspectRatio(
            product.featuredImage?.width ?? 0,
            product.featuredImage?.height ?? 0,
          ) > 1;

        return (
          <div
            className={`relative h-auto md:h-auto col-span-2 ${isWideImage ? 'md:col-span-2' : 'md:col-span-1'}`}
            key={product.id}
          >
            <figure className="w-full h-full m-0">
              {product.featuredImage && (
                <Image
                  data={product.featuredImage}
                  loading="lazy"
                  className="max-w-full w-full max-h-full h-auto object-cover"
                />
              )}
              <figcaption className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0">
                <h2>{product.title}</h2>
                <p>{product.description}</p>
                <Money data={product.priceRange.minVariantPrice} />
              </figcaption>
            </figure>
          </div>
        );
      })}
    </div>
  );
}
