import type {ProductVariantFragment} from 'storefrontapi.generated';
import {Image} from '@shopify/hydrogen';
import {animated, useScroll, useSpring} from '@react-spring/web';
import { aspectRatio } from '~/lib/utils/utils';

export function ProductImage({
  image,
}: {
  image: ProductVariantFragment['image'];
}) {
  useScroll({
    onChange: ({value: {scrollYProgress}}) => {
      if (scrollYProgress > 0.04) {
        if (scrollYProgress > 0.45) {
          imageApi.start({
            scale: 0,
            opacity: 0,
            config: {
              mass: 1,
              tension: 120,
              friction: 14,
            },
          });
        } else {
          imageApi.start({
            opacity: 1,
            scale: 0.48,
            config: {
              mass: 1,
              tension: 120,
              friction: 14,
            },
          });
        }
      } else {
        imageApi.start({
          scale: 1,
          config: {
            mass: 1,
            tension: 120,
            friction: 14,
          },
        });
      }
    },
  });

  const [imageSprings, imageApi] = useSpring(
    () => ({
      from: {
        opacity: 1,
        scale: 0.8,
      },
      to: {
        scale: 1,
      },
      config: {
        mass: 1,
        tension: 120,
        friction: 14,
      },
    }),
    [],
  );

  const isWideImage = aspectRatio(image?.width ?? 0, image?.height ?? 0) > 1;

  if (!image) {
    return <div className="product-image" />;
  }
  return (
    <animated.figure
      style={imageSprings}
      className={`absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 md:fixed md:top-[45%] md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 flex justify-center items-center ${isWideImage ? 'w-full md:w-7/12' : 'w-9/12 sm:w-7/12 md:w-1/3'} h-fit z-[1] p-0 m-0 rounded-lg`}
    >
      <Image
        alt={image.altText || 'Product Image'}
        data={image}
        key={image.id}
        sizes="(min-width: 45em) 50vw, 100vw"
        loading="eager"
        className="max-w-full max-h-full h-auto w-full object-contain rounded-lg z-50"
      />
    </animated.figure>
  );
}
