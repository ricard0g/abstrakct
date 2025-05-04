import type {ProductVariantFragment} from 'storefrontapi.generated';
import {Image} from '@shopify/hydrogen';
import {animated, useScroll, useSpring} from '@react-spring/web';

function aspectRatio(width: number, height: number) {
  return width / height;
}

export function ProductImage({
  image,
}: {
  image: ProductVariantFragment['image'];
}) {
  useScroll({
    onChange: ({value: {scrollYProgress}}) => {
      if (scrollYProgress > 0.09) {
        if (scrollYProgress > 0.8) {
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
      className={`fixed top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex justify-center items-center w-1/3 ${isWideImage ? 'w-7/12' : 'w-1/3'} h-fit z-50 p-0 m-0 rounded-lg`}
    >
      <Image
        alt={image.altText || 'Product Image'}
        data={image}
        key={image.id}
        sizes="(min-width: 45em) 50vw, 100vw"
        className="max-w-full max-h-full h-auto w-full object-contain rounded-lg z-50"
      />
    </animated.figure>
  );
}
