import { memo } from "react";
import { ProductCopy } from "~/lib/types/productTypes";
import { animated, useSpring, useScroll } from "@react-spring/web";


export const AnimatedHeading = memo(function AnimatedHeading({
  productCopy,
}: {
  productCopy: ProductCopy | null;
}) {
  const [textSprings, textApi] = useSpring(() => ({
    y: '-100%',
    opacity: 0,
    config: {
      mass: 1,
      tension: 100,
      friction: 10,
    },
  }));

  useScroll({
    onChange: ({value: {scrollYProgress}}) => {
      let yValue = -100;
      let opacityValue = 0;
      const startThreshold = 0.2;
      const endThreshold = 0.4;

      if (
        scrollYProgress >= startThreshold &&
        scrollYProgress <= endThreshold
      ) {
        const relativeProgress =
          (scrollYProgress - startThreshold) / (endThreshold - startThreshold);
        yValue = -100 + relativeProgress * 100;
        opacityValue = relativeProgress;
      } else if (scrollYProgress > endThreshold) {
        yValue = 0;
        opacityValue = 1;
      }

      textApi.start({y: `${yValue}%`, opacity: opacityValue});
    },
    default: {
      immediate: true,
    },
  });

  return (
    <section className="relative bg-white flex items-center justify-center w-full h-full my-32 md:my-72 z-[2]">
      <h2 className="flex items-center justify-center text-6xl md:text-8xl font-display tracking-tighter overflow-hidden">
        <animated.span
          style={textSprings}
          className="inline-block w-full md:max-w-3/5 mx-auto text-center "
        >
          {productCopy?.['animated-heading']}
        </animated.span>
      </h2>
    </section>
  );
});