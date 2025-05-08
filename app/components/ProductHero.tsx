import { animated, useSpring } from "@react-spring/web";
import { ProductFragment } from "storefrontapi.generated";
import { memo } from "react";
import { Money } from "@shopify/hydrogen";

export const ProductHero = memo(function ProductHero({
  title,
  selectedVariant,
}: {
  title: string;
  selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
}) {
  const [textSprings] = useSpring(
    () => ({
      from: {
        y: '100%',
      },
      to: {
        y: '0',
      },
      config: {
        mass: 1,
        tension: 100,
        friction: 10,
      },
    }),
    [],
  );

  return (
    <section className="flex flex-col items-center justify-center w-full max-h-full h-[70vh] mx-auto overflow-hidden -z-20">
      <div className="flex flex-col items-start justify-between md:justify-center relative w-full h-full overflow-hidden">
        <h1 className="inline-flex whitespace-nowrap mb-5 animate-carousel">
          {/* First set of titles */}
          <span className="block overflow-hidden">
            <animated.span
              style={textSprings}
              className="inline-block text-[100px] md:text-[200px] text-transparent bg-clip-text bg-gradient-to-br from-stone-900 via-zinc-500 to-gray-800 bg-[size:200%_200%] font-display font-normal mx-5 animate-bg-rotate -z-20"
            >
              {title}
            </animated.span>
          </span>
          {/* Duplicate set to create seamless loop */}
          <span className="block overflow-hidden">
            <animated.span
              style={textSprings}
              className="inline-block text-[100px] md:text-[200px] text-transparent bg-clip-text bg-gradient-to-br from-slate-900 via-gray-500 to-neutral-800 bg-[size:200%_200%] font-display font-normal mx-5 animate-bg-rotate -z-20"
            >
              {title}
            </animated.span>
          </span>
        </h1>
        <div className="block w-full overflow-hidden">
          <animated.h2
            style={textSprings}
            className="flex items-end justify-between md:block my-0"
          >
            <span className="block max-w-1/2 md:w-auto md:hidden text-2xl text-zinc-500">
              {title}
            </span>
            <Money
              className="text-4xl md:text-6xl"
              data={
                selectedVariant?.price ?? {amount: '0', currencyCode: 'EUR'}
              }
            />
          </animated.h2>
        </div>
      </div>
    </section>
  );
});