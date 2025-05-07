import {memo, Suspense} from 'react';
import {useStableIds} from '~/lib/hooks/useStableIds';
import {Await} from '@remix-run/react';
import {animated} from '@react-spring/web';
import {ProductCarousel} from './ProductCarousel';
import {ProductRecommendationsQuery} from 'storefrontapi.generated';

export const YouMayAlsoLike = memo(function YouMayAlsoLike({
  recommendedProducts,
}: {
  recommendedProducts: ProductRecommendationsQuery['productRecommendations'];
}) {
  const ids = useStableIds(3);

  return (
    <section className="flex flex-col items-center justify-center w-full max-h-full h-full mx-auto overflow-hidden">
      <div className="flex flex-col items-start justify-between md:justify-center relative w-full h-full overflow-hidden">
        <h2 className="inline-flex whitespace-nowrap mb-5 animate-carousel">
          {/* First set of titles */}
          <span className="block overflow-hidden">
            {ids.map((id) => (
              <animated.span
                key={id}
                className="inline-flex justify-center items-center uppercase text-[50px] md:text-[100px] text-transparent bg-clip-text bg-gradient-to-br from-stone-900 via-zinc-500 to-gray-800 bg-[size:200%_200%] font-display font-normal mt-14 md:mt-0 mx-5 animate-bg-rotate"
              >
                <span className="mr-5">You May Also Like</span>
                <span className="bg-clip-text bg-gradient-to-br from-stone-900 via-zinc-500 to-gray-800 ml-5 animate-rotate">
                  <span className="text-transparent">⊛</span>
                </span>
              </animated.span>
            ))}
          </span>
          {/* Duplicate set to create seamless loop */}
          <span className="block overflow-hidden">
            {ids.map((id) => (
              <animated.span
                key={id}
                className="inline-flex justify-center items-center uppercase text-[50px] md:text-[100px] text-transparent bg-clip-text bg-gradient-to-br from-slate-900 via-gray-500 to-neutral-800 bg-[size:200%_200%] font-display font-normal mt-14 md:mt-0 mx-5 animate-bg-rotate"
              >
                <span className="mr-5">You May Also Like</span>
                <span className="bg-clip-text bg-gradient-to-br from-stone-900 via-zinc-500 to-gray-800 ml-5 animate-rotate">
                  <span className="text-transparent">⊛</span>
                </span>
              </animated.span>
            ))}
          </span>
        </h2>
      </div>
      <Suspense fallback={<div>Loading recommended products...</div>}>
        <Await resolve={recommendedProducts}>
          {(data) => <ProductCarousel products={data || []} />}
        </Await>
      </Suspense>
    </section>
  );
});
