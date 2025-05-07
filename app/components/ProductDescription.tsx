import { Metafield } from "@shopify/hydrogen/storefront-api-types";
import { memo, useMemo } from "react";
import { animated, useSpring, useScroll } from "@react-spring/web";
import { useResponsive } from "~/lib/hooks/useResponsive";
import { ProductCopy } from "~/lib/types/productTypes";


export const ProductDescription = memo(function ProductDescription({
  metafields,
  productCopy,
}: {
  metafields: Metafield[];
  productCopy: ProductCopy | null;
}) {
  const {isMobile} = useResponsive();

  const [textSprings, textApi] = useSpring(() => ({
    y: '100%', // Start fully hidden
  }));

  const [widthSpring, widthApi] = useSpring(() => ({
    width: '0',
  }));

  useScroll({
    onChange: ({value: {scrollYProgress}}) => {
      // Log the scroll progress relative to the page
      // console.log('Global scrollYProgress:', scrollYProgress);

      let widthValue = 0;
      let yValue = 100; // Default to 100% (hidden)
      const startThreshold = isMobile ? 0.15 : 0.05; // Keep the start point
      const endThreshold = isMobile ? 0.3 : 0.2; // NEW: Define the animation end point

      // Check if we are within the animation range
      if (
        scrollYProgress >= startThreshold &&
        scrollYProgress <= endThreshold
      ) {
        // Calculate progress ONLY within the 0.2 to 0.3 range.
        // When scrollYProgress is 0.2, this is 0.
        // When scrollYProgress is 0.3, this is 1.
        const relativeProgress =
          (scrollYProgress - startThreshold) / (endThreshold - startThreshold);

        // Interpolate y from 100 down to 0 based on this shorter range progress
        yValue = 100 - relativeProgress * 100;
        widthValue = relativeProgress * 100;
      } else if (scrollYProgress > endThreshold) {
        // If we've scrolled past 30%, the animation should be fully complete (text shown)
        yValue = 0;
        widthValue = 100;
      }
      // If scrollYProgress < startThreshold (before 20%), yValue remains 100 (initial value - hidden)

      // Update the spring animation
      textApi.set({y: `${yValue}%`});
      widthApi.set({width: `${widthValue}%`});
    },
    // You might want immediate: true if the animation feels laggy on start
    default: {
      immediate: true,
    },
  });

  const paintingLocation: string | undefined = useMemo(
    () =>
      metafields.find((metafield) => metafield?.key === 'painting_location')
        ?.value,
    [metafields],
  );
  const style: string | undefined = useMemo(
    () => metafields.find((metafield) => metafield?.key === 'style')?.value,
    [metafields],
  );
  const medium: string | undefined = useMemo(
    () => metafields.find((metafield) => metafield?.key === 'medium')?.value,
    [metafields],
  );
  const year: string | undefined = useMemo(
    () => metafields.find((metafield) => metafield?.key === 'year')?.value,
    [metafields],
  );
  const artist: string | undefined = useMemo(
    () => metafields.find((metafield) => metafield?.key === 'artist')?.value,
    [metafields],
  );

  return (
    <div className="flex flex-col md:flex-row items-center justify-between w-full my-[100px] overflow-y-auto relative">
      {/* Ensure content inside is taller than h-[500px] to allow scrolling */}
      <div className="flex flex-col gap-5 w-full md:max-w-[35%]">
        <h2 className="block relative text-4xl md:text-7xl font-display tracking-tighter overflow-hidden">
          <animated.span style={textSprings} className="inline-block">
            {productCopy?.['description-section']['concise-heading']}
          </animated.span>
        </h2>
        <p className="text-base md:text-lg tracking-wide text-pretty overflow-hidden">
          <animated.span style={textSprings} className="inline-block">
            {productCopy?.['description-section']['concise-description']}
          </animated.span>
        </p>
      </div>
      <div className="w-full my-6 md:my-0 md:max-w-[35%] ">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="block overflow-hidden">
              <animated.span
                style={textSprings}
                className="inline-block font-bold"
              >
                Painting Location
              </animated.span>
            </span>
            <span className="block max-w-1/2 overflow-hidden">
              <animated.span
                style={textSprings}
                className="inline-block text-end"
              >
                {paintingLocation}
              </animated.span>
            </span>
          </div>
          <animated.div
            style={widthSpring}
            className="w-full h-[1px] bg-black"
          ></animated.div>
          <div className="flex items-center justify-between">
            <span className="block overflow-hidden">
              <animated.span
                style={textSprings}
                className="inline-block font-bold"
              >
                Style
              </animated.span>
            </span>
            <span className="block max-w-1/2 overflow-hidden">
              <animated.span
                style={textSprings}
                className="inline-block text-end"
              >
                {style}
              </animated.span>
            </span>
          </div>
          <animated.div
            style={widthSpring}
            className="w-full h-[1px] bg-black"
          ></animated.div>
          <div className="flex items-center justify-between">
            <span className="block overflow-hidden">
              <animated.span
                style={textSprings}
                className="inline-block font-bold"
              >
                Medium
              </animated.span>
            </span>
            <span className="block max-w-1/2 overflow-hidden">
              <animated.span
                style={textSprings}
                className="inline-block text-end"
              >
                {medium}
              </animated.span>
            </span>
          </div>
          <animated.div
            style={widthSpring}
            className="w-full h-[1px] bg-black"
          ></animated.div>
          <div className="flex items-center justify-between">
            <span className="block overflow-hidden">
              <animated.span
                style={textSprings}
                className="inline-block font-bold"
              >
                Year
              </animated.span>
            </span>
            <span className="block max-w-1/2 overflow-hidden">
              <animated.span
                style={textSprings}
                className="inline-block text-end"
              >
                {year}
              </animated.span>
            </span>
          </div>
          <animated.div
            style={widthSpring}
            className="w-full h-[1px] bg-black"
          ></animated.div>
          <div className="flex items-center justify-between">
            <span className="block overflow-hidden">
              <animated.span
                style={textSprings}
                className="inline-block font-bold"
              >
                Artist
              </animated.span>
            </span>
            <span className="block max-w-1/2 overflow-hidden">
              <animated.span
                style={textSprings}
                className="inline-block text-end"
              >
                {artist}
              </animated.span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});