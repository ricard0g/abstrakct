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
    <div className="grid grid-cols-2 auto-rows-auto gap-4 place-items-center">
      {products.map((product) => {
        const isWideImage = aspectRatio(product.featuredImage?.width ?? 0, product.featuredImage?.height ?? 0) > 1.5;
        
        return (
          <div
            className={`${isWideImage ? 'col-span-2' : 'col-span-1'}`}
            key={product.id}
          >
            <figure>
              {product.featuredImage && (
                <Image 
                  data={product.featuredImage} 
                  sizes={isWideImage 
                    ? "(max-width: 768px) 100vw, 100vw" 
                    : "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  }
                  loading="lazy"
                  className="w-full h-auto object-cover"
                />
              )}
              <figcaption>
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
