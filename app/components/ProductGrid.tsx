import {Image, Money} from '@shopify/hydrogen';
import {type IndexLoader} from '~/routes/($locale)._index';
import {useState} from 'react';

function aspectRatio(width: number, height: number) {
  return width / height;
}

export default function ProductGrid({
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
              <figcaption className="absolute max-w-2/5 left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0">
                <h2 className="text-center text-balance font-display font-extralight">
                  {product.title}
                </h2>
                <ProductDescription description={product.description} />
                <Money
                  className="w-fit mx-auto my-3 py-1 px-2 font-thin bg-gray-500/80 rounded-md"
                  data={product.priceRange.minVariantPrice}
                />
              </figcaption>
            </figure>
          </div>
        );
      })}
    </div>
  );
}

function ProductDescription({description}: {description: string}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="relative">
      <div
        className={`relative mx-auto overflow-hidden transition-all duration-500 ease-linear ${expanded ? 'max-h-96' : 'max-h-24'}`}
      >
        <p className="text-center text-pretty">{description}</p>
        {!expanded && (
          <div
            className="absolute inset-0 mask-luminance"
            style={{
              maskImage:
                'linear-gradient(to bottom, transparent 100%, black 50%)',
            }}
          ></div>
        )}
      </div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-3 px-4 py-1 text-xs uppercase tracking-wider font-medium bg-black/40 text-white/90 hover:bg-black/60 hover:text-white rounded-full border border-white/20 transition-all duration-200 backdrop-blur-sm block mx-auto cursor-none"
      >
        {expanded ? 'Show Less' : 'Read More'}
      </button>
    </div>
  );
}
