import {useState, useRef, useEffect, useMemo, useCallback} from 'react';
import {useSpring, animated} from '@react-spring/web';
import {Link} from '@remix-run/react';
import {Image, Money} from '@shopify/hydrogen';
import {aspectRatio} from '~/lib/utils/utils';
import Spinner from './Spinner';

export default function ProductItem({product, image}: {product: any, image?: any}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    // Check if image is already cached
    if (imageRef.current && imageRef.current.complete) {
      setImageLoaded(true);
    }
  }, []);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const isWideImage = useMemo(
    () =>
      aspectRatio(
        product.featuredImage?.width ?? 0,
        product.featuredImage?.height ?? 0,
      ) > 1,
    [product.featuredImage],
  );

  return (
    <animated.div
      className={`relative flex flex-col justify-center items-center min-h-[25vh] h-auto col-span-1 rounded-lg group hover:border-gray-200 ${
        isWideImage ? 'md:col-span-2' : 'md:col-span-1'
      }`}
    >
      <figure className="w-full h-full m-0 relative">
        <Link to={`/products/${product.handle}`}>
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg z-10">
              <Spinner
                size={40}
                color="#000000"
                secondaryColor="#e5e5e5"
                thickness={3}
              />
            </div>
          )}
          {image && (
            <Image
              ref={imageRef}
              data={product.featuredImage ? product.featuredImage : image}
              loading="lazy"
              onLoad={handleImageLoad}
              className={`max-w-full w-full max-h-full h-auto rounded-lg object-cover transition-opacity duration-500`}
            />
          )}
        </Link>
        <figcaption >
          <h2 className='text-sm text-center text-pretty group-hover:underline'>
            {product.title}
          </h2>
          <Money
            className="w-fit mx-auto my-3 py-1 px-2 font-thin text-white bg-gray-500/80 rounded-md"
            data={product.priceRange.minVariantPrice}
          />
        </figcaption>
      </figure>
    </animated.div>
  );
}