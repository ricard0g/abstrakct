import type {ProductVariantFragment} from 'storefrontapi.generated';
import {Image} from '@shopify/hydrogen';
import {animated, useSpring} from '@react-spring/web';

function aspectRatio(width: number, height: number) {
  return width / height;
}

export function ProductImage({
  image,
}: {
  image: ProductVariantFragment['image'];
}) {
  const [imageSprings, imageApi] = useSpring(
    () => ({
      from: {
        // opacity: 0,
        scale: 0.8,
      },
      to: {
        // opacity: 1,
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
    <div
      className={`fixed ${isWideImage ? 'top-40' : 'top-32'} left-0 flex justify-center items-center w-full h-[90%} mx-auto z-10`}
    >
      <animated.figure
        style={imageSprings}
        className={`${isWideImage ? 'min-w-7/12' : 'w-1/3'}`}
      >
        <Image
          alt={image.altText || 'Product Image'}
          data={image}
          key={image.id}
          sizes="(min-width: 45em) 50vw, 100vw"
          className="max-w-full max-h-full h-auto w-full object-contain"
        />
      </animated.figure>
    </div>
  );
}
