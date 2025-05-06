import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {Image, Video} from '@shopify/hydrogen';
import {Link, useLoaderData, type MetaFunction} from '@remix-run/react';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
  Money,
} from '@shopify/hydrogen';
import {ProductImage} from '~/components/ProductImage';
import {animated, useScroll, useSpring} from '@react-spring/web';
import {AddToCartButton} from '~/components/AddToCartButton';
import type {
  ProductFragment,
  RecommendedProductsQuery,
} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {memo, useCallback, useEffect, useMemo, useState, Suspense} from 'react';
import {Parallax, ParallaxLayer} from '@react-spring/parallax';
import {useResponsive} from '~/lib/hooks/useResponsive';
import {Await} from '@remix-run/react';
import useEmblaCarousel from 'embla-carousel-react';
import {EmblaCarouselType} from 'embla-carousel';
import type {Product} from '@shopify/hydrogen/storefront-api-types';

type Metafield = {
  id: string;
  key: string;
  value: string;
};

type ProductCopy = {
  'description-section': {
    'concise-heading': string;
    'concise-description': string;
  };
  'animated-heading': string;
  'history-section': {
    heading: string;
    'first-block': {
      'text-block': string;
      image_url: string;
    };
    'second-block': {
      'text-block': string;
      image_url: string;
    };
    'third-block': {
      'text-block': string;
      image_url: string;
    };
  };
};

export const meta: MetaFunction<typeof loader> = ({data}) => {
  return [
    {title: `Abstrakct | ${data?.product.title ?? ''}`},
    {
      rel: 'canonical',
      href: `/products/${data?.product.handle}`,
    },
  ];
};

export async function loader(args: LoaderFunctionArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({
  context,
  params,
  request,
}: LoaderFunctionArgs) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {
        handle,
        selectedOptions: getSelectedProductOptions(request),
        metafieldIdentifiers: [
          {
            namespace: 'custom',
            key: 'product_copy',
          },
          {
            namespace: 'custom',
            key: 'painting_location',
          },
          {
            namespace: 'custom',
            key: 'style',
          },
          {
            namespace: 'custom',
            key: 'medium',
          },
          {
            namespace: 'custom',
            key: 'year',
          },
          {
            namespace: 'custom',
            key: 'artist',
          },
        ],
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  return {
    product,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context, params}: LoaderFunctionArgs) {
  // Put any API calls that is not critical to be available on first page render
  // For example: product reviews, product recommendations, social feeds.
  const {storefront} = context;

  const {handle} = params;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const productId = storefront.query(PRODUCT_ID_QUERY, {
    variables: {
      handle,
    },
  });

  if (!productId) {
    throw new Error('Expected product id to be defined');
  }

  const recommendedProducts = storefront
    .query(PRODUCT_ID_QUERY, {
      variables: {
        handle,
      },
    })
    .then((product) => {
      if (!product) {
        return null;
      }

      return storefront.query(PRODUCT_RECOMMENDATIONS_QUERY, {
        variables: {
          productId: product.product.id,
        },
      });
    })
    .catch((error: Error) => {
      console.error(error);
      return null;
    });

  return {
    recommendedProducts,
  };
}

export default function Product() {
  const {product} = useLoaderData<typeof loader>();

  // Optimistically selects a variant with given available variant information
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  // Sets the search param to the selected variant without navigation
  // only when no search params are set in the url
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  const {title, metafields} = product;
  const {open} = useAside();

  const handleAddToCart = useCallback(() => {
    open('cart');
  }, [open]);

  const productCopy = useMemo(() => {
    const productCopyMetafield = metafields.find(
      (metafield) => metafield?.key === 'product_copy',
    );

    return productCopyMetafield?.value
      ? (JSON.parse(productCopyMetafield.value) as ProductCopy)
      : null;
  }, [metafields]);

  return (
    <div>
      <ProductImage image={selectedVariant?.image} />
      <ProductHero title={title} selectedVariant={selectedVariant} />
      <AddToCartButton
        disabled={!selectedVariant || !selectedVariant.availableForSale}
        lines={
          selectedVariant
            ? [
                {
                  merchandiseId: selectedVariant.id,
                  quantity: 1,
                  selectedVariant,
                },
              ]
            : []
        }
        onClick={handleAddToCart}
      >
        {selectedVariant?.availableForSale ? 'Add to cart' : 'Sold out'}
      </AddToCartButton>
      <ProductDescription
        metafields={metafields as Metafield[]}
        productCopy={productCopy}
      />
      <AnimatedHeading productCopy={productCopy} />
      <ProductHistory productCopy={productCopy} />
      <YouMayAlsoLike />
      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </div>
  );
}

const ProductHero = memo(function ProductHero({
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
    <section className="flex flex-col items-center justify-center w-full max-h-full h-[80vh] mx-auto overflow-hidden -z-20">
      <div className="flex flex-col items-start justify-between md:justify-center relative w-full h-full overflow-hidden">
        <h1 className="inline-flex whitespace-nowrap mb-5 animate-carousel">
          {/* First set of titles */}
          <span className="block overflow-hidden">
            {[...Array(1)].map((_, i) => (
              <animated.span
                style={textSprings}
                key={i}
                className="inline-block text-[100px] md:text-[200px] text-transparent bg-clip-text bg-gradient-to-br from-stone-900 via-zinc-500 to-gray-800 bg-[size:200%_200%] font-display font-normal mx-5 animate-bg-rotate -z-20"
              >
                {title}
              </animated.span>
            ))}
          </span>
          {/* Duplicate set to create seamless loop */}
          <span className="block overflow-hidden">
            {[...Array(1)].map((_, i) => (
              <animated.span
                style={textSprings}
                key={`dup-${i}`}
                className="inline-block text-[100px] md:text-[200px] text-transparent bg-clip-text bg-gradient-to-br from-slate-900 via-gray-500 to-neutral-800 bg-[size:200%_200%] font-display font-normal mx-5 animate-bg-rotate -z-20"
              >
                {title}
              </animated.span>
            ))}
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

const ProductDescription = memo(function ProductDescription({
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
      console.log('Global scrollYProgress:', scrollYProgress);

      let widthValue = 0;
      let yValue = 100; // Default to 100% (hidden)
      const startThreshold = isMobile ? 0.15 : 0.05; // Keep the start point
      const endThreshold = isMobile ? 0.3 : 0.35; // NEW: Define the animation end point

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

const AnimatedHeading = memo(function AnimatedHeading({
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
      const startThreshold = 0.3;
      const endThreshold = 0.5;

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

const ProductHistory = memo(function ProductHistory({
  productCopy,
}: {
  productCopy: ProductCopy | null;
}) {
  const {isMobile} = useResponsive();

  const headingText = useMemo(
    () => productCopy?.['history-section']?.['heading'] || '',
    [productCopy],
  );

  const firstBlockText = useMemo(
    () => productCopy?.['history-section']['first-block']['text-block'] || '',
    [productCopy],
  );

  const secondBlockText = useMemo(
    () => productCopy?.['history-section']['second-block']['text-block'] || '',
    [productCopy],
  );

  const thirdBlockText = useMemo(
    () => productCopy?.['history-section']['third-block']['text-block'] || '',
    [productCopy],
  );

  const totalPages = isMobile ? 7 : 4;

  return (
    <section className="relative min-h-[100vh]">
      {/* Parallax History Section */}
      <section className="block w-full md:w-11/12 mx-auto h-[85vh] top-0 mt-10 z-[2]">
        <Parallax
          key={isMobile ? 'mobile' : 'desktop'}
          pages={totalPages}
          className="absolute top-0 left-0 w-full h-full bg-zinc-900 border-[1px] border-zinc-700 rounded-lg overflow-hidden [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-500 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-gray-500 [&::-webkit-scrollbar-thumb:hover]:bg-zinc-400 scrollbar-thin scrollbar-track-zinc-800 scrollbar-thumb-zinc-500"
          style={{
            backgroundColor: '#18181b',
            opacity: 1,
            backgroundImage:
              'radial-gradient(#373737 0.9500000000000001px, transparent 0.9500000000000001px), radial-gradient(#373737 0.9500000000000001px, #18181b 0.9500000000000001px)',
            backgroundSize: '38px 38px',
            backgroundPosition: '0 0, 19px 19px',
          }}
        >
          {/* Heading - Section 1 */}
          <ParallaxLayer
            offset={0}
            speed={isMobile ? 0.2 : 0.1}
            factor={1}
            className="flex items-center justify-center"
          >
            <div className="flex flex-col items-center gap-y-10 justify-center max-w-full md:max-w-[70%] w-full h-full px-2 md:px-5 py-5">
              <h2 className="text-5xl md:text-7xl font-display tracking-tight text-center mb-12 text-gray-100 overflow-hidden">
                {headingText}
              </h2>
              <p className="flex flex-col items-center gap-x-2 text-gray-100 text-base md:text-2xl tracking-wide text-center ">
                <span className="inline-block">Scroll</span>
                <span className="inline-block">
                  <svg
                    width="20px"
                    height="20px"
                    viewBox="0 0 1024 1024"
                    className="icon"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="#ffffff"
                  >
                    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                    <g
                      id="SVGRepo_tracerCarrier"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></g>
                    <g id="SVGRepo_iconCarrier">
                      <path
                        d="M903.232 256l56.768 50.432L512 768 64 306.432 120.768 256 512 659.072z"
                        fill="#fff"
                      ></path>
                    </g>
                  </svg>
                </span>
              </p>
            </div>
          </ParallaxLayer>

          {/* First Block - Section 2 */}
          <ParallaxLayer
            offset={isMobile ? 2 : 1}
            speed={isMobile ? 0.3 : 0.1}
            factor={1}
            className="flex items-center justify-center md:justify-start px-5 md:px-20"
          >
            <div className="flex flex-col items-center justify-center max-w-full md:max-w-1/3 w-full h-full">
              <h3 className="w-full text-4xl md:text-6xl font-display text-left tracking-tighter mb-10 pb-2 overflow-hidden text-gray-200">
                History
              </h3>
              <p className="text-xl md:text-2xl tracking-wide leading-loose md:leading-relaxed text-pretty overflow-hidden text-gray-300">
                {firstBlockText}
              </p>
            </div>
          </ParallaxLayer>

          <ParallaxLayer
            offset={isMobile ? 1 : 1}
            speed={isMobile ? 0.4 : 0.7}
            factor={isMobile ? 1.5 : 1}
            className="flex items-center justify-center md:justify-end px-2 md:px-20"
          >
            <div className="flex flex-col items-center justify-center max-w-full w-full md:max-w-7/12 md:w-6/12 max-h-[600px] md:max-h-[700px] h-full">
              <Image
                src={
                  productCopy?.['history-section']['first-block']['image_url']
                }
                alt="Product Image"
                loading="lazy"
                className="max-w-full w-full max-h-full h-full object-cover rounded-lg"
              />
            </div>
          </ParallaxLayer>

          {/* Second Block - Section 3 */}
          <ParallaxLayer
            offset={isMobile ? 4 : 2}
            speed={0.1}
            factor={1}
            className="flex items-center justify-center md:justify-end px-5 md:px-20"
          >
            <div className="flex flex-col items-center justify-center max-w-full md:max-w-1/3 w-full h-full">
              <h3 className="w-full text-4xl md:text-6xl font-display text-left tracking-tighter mb-10 pb-2 overflow-hidden text-gray-200">
                The Process
              </h3>
              <p className="text-xl md:text-2xl tracking-wide leading-loose md:leading-relaxed text-pretty overflow-hidden text-gray-300">
                {secondBlockText}
              </p>
            </div>
          </ParallaxLayer>

          <ParallaxLayer
            offset={isMobile ? 3 : 2}
            speed={0.7}
            factor={isMobile ? 1.5 : 1}
            className="flex items-center justify-center md:justify-start px-2 md:px-20"
          >
            <div className="flex flex-col items-center justify-center max-w-full w-full md:max-w-7/12 md:w-6/12 max-h-[600px] md:max-h-[700px] h-full">
              <Video
                data={{
                  sources: [
                    {
                      url:
                        productCopy?.['history-section']['second-block'][
                          'image_url'
                        ] || '',
                      mimeType: 'video/mp4',
                    },
                  ],
                }}
                controls={false}
                autoPlay={true}
                muted={true}
                loop={true}
                className="max-w-full w-full max-h-full h-full object-cover rounded-lg"
              />
            </div>
          </ParallaxLayer>

          {/* Third Block - Section 4 */}
          <ParallaxLayer
            offset={isMobile ? 6 : 3}
            speed={0.1}
            factor={1}
            className="flex items-center justify-center md:justify-start px-5 md:px-20"
          >
            <div className="flex flex-col items-center justify-center max-w-full md:max-w-1/3 w-full h-full">
              <h3 className="w-full text-4xl md:text-6xl font-display text-left tracking-tighter mb-10 pb-2 overflow-hidden text-gray-200">
                More History
              </h3>
              <p className="text-xl md:text-2xl tracking-wide leading-loose md:leading-relaxed text-pretty overflow-hidden text-gray-300">
                {thirdBlockText}
              </p>
            </div>
          </ParallaxLayer>

          <ParallaxLayer
            offset={isMobile ? 5 : 3}
            speed={0.7}
            factor={isMobile ? 1.5 : 1}
            className="flex items-center justify-center md:justify-end px-2 md:px-20"
          >
            <div className="flex flex-col items-center justify-center max-w-full w-full md:max-w-7/12 md:w-6/12 max-h-[600px] md:max-h-[700px] h-full">
              <Image
                src={
                  productCopy?.['history-section']['third-block']['image_url']
                }
                loading="lazy"
                alt="Product Image"
                className="max-w-full w-full max-h-full h-full object-cover rounded-4xl"
              />
            </div>
          </ParallaxLayer>
        </Parallax>
      </section>
    </section>
  );
});

function YouMayAlsoLike() {
  const {recommendedProducts} = useLoaderData<typeof loader>();

  console.log(recommendedProducts);
  return (
    <section className="flex flex-col items-center justify-center w-full max-h-full h-full mx-auto overflow-hidden">
      <div className="flex flex-col items-start justify-between md:justify-center relative w-full h-full overflow-hidden">
        <h1 className="inline-flex whitespace-nowrap mb-5 animate-carousel">
          {/* First set of titles */}
          <span className="block overflow-hidden">
            {[...Array(3)].map((_, i) => (
              <animated.span
                key={i}
                className="inline-flex justify-center items-center uppercase text-[80px] md:text-[100px] text-transparent bg-clip-text bg-gradient-to-br from-stone-900 via-zinc-500 to-gray-800 bg-[size:200%_200%] font-display font-normal mx-5 animate-bg-rotate"
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
            {[...Array(3)].map((_, i) => (
              <animated.span
                key={`dup-${i}`}
                className="inline-flex justify-center items-center uppercase text-[80px] md:text-[100px] text-transparent bg-clip-text bg-gradient-to-br from-slate-900 via-gray-500 to-neutral-800 bg-[size:200%_200%] font-display font-normal mx-5 animate-bg-rotate"
              >
                <span className="mr-5">You May Also Like</span>
                <span className="bg-clip-text bg-gradient-to-br from-stone-900 via-zinc-500 to-gray-800 ml-5 animate-rotate">
                  <span className="text-transparent">⊛</span>
                </span>
              </animated.span>
            ))}
          </span>
        </h1>
      </div>
      <Suspense fallback={<div>Loading recommended products...</div>}>
        <Await resolve={recommendedProducts}>
          {(data) => <ProductCarousel products={data?.productRecommendations || []} />}
        </Await>
      </Suspense>
    </section>
  );
}

const ProductCarousel = memo(function ProductCarousel({
  products,
}: {
  products: Product[];
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({dragFree: true});
  const [scrollProgress, setScrollProgress] = useState<number>(0);

  const onScroll = useCallback((emblaApi: EmblaCarouselType) => {
    const progress = Math.max(0, Math.min(1, emblaApi?.scrollProgress() || 0));
    setScrollProgress(progress);
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onScroll(emblaApi);
    emblaApi
      .on('reInit', onScroll)
      .on('scroll', onScroll)
      .on('slideFocus', onScroll);

    return () => {
      emblaApi.off('reInit', onScroll);
      emblaApi.off('scroll', onScroll);
      emblaApi.off('slideFocus', onScroll);
    };
  }, [emblaApi, onScroll]);

  return (
    <div>
      <div className="embla__progress">
        <div
          className="embla__progress__bar"
          style={{transform: `translate3d(${scrollProgress * 100}%, 0, 0)`}}
        ></div>
      </div>
      <div ref={emblaRef} className="embla">
        <ul className="embla__container">
          {products.map((product) => (
            <li className="embla__slide mr-10" key={product.id}>
              <Link to={`/products/${product.handle}`}>
                <Image
                  src={product.images.nodes[0].url}
                  alt={product.title}
                  className="w-full h-full object-contain cursor-grab"
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
});

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
` as const;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    metafields(identifiers: $metafieldIdentifiers) {
      id
      key
      value
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
    $metafieldIdentifiers: [HasMetafieldsIdentifier!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    images(first: 1) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
  }
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 8, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
` as const;

const PRODUCT_RECOMMENDATIONS_QUERY = `#graphql
  fragment ProductRecommendation on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    images(first: 1) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
  }
  query productRecommendations($productId: ID) {
    productRecommendations(productId: $productId) {
      ...ProductRecommendation
    }
  }
`;

const PRODUCT_ID_QUERY = `#graphql
  query ProductId($handle: String!) {
    product(handle: $handle) {
      id
    }
  }
` as const;
