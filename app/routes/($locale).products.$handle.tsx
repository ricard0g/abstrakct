import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {Image, Video} from '@shopify/hydrogen';
import {useLoaderData, type MetaFunction} from '@remix-run/react';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
  Money,
} from '@shopify/hydrogen';
import {ProductImage} from '~/components/ProductImage';
import {animated, useScroll, useSpring, useInView} from '@react-spring/web';
import {AddToCartButton} from '~/components/AddToCartButton';
import type {ProductFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {useState, useEffect} from 'react';
import {Parallax, ParallaxLayer} from '@react-spring/parallax';

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

  return {};
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

  const productCopyMetafield = metafields.find(
    (metafield) => metafield?.key === 'product_copy',
  );

  const productCopy = productCopyMetafield?.value
    ? (JSON.parse(productCopyMetafield.value) as ProductCopy)
    : null;

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
        onClick={() => {
          open('cart');
        }}
      >
        {selectedVariant?.availableForSale ? 'Add to cart' : 'Sold out'}
      </AddToCartButton>
      <ProductDescription
        metafields={metafields as Metafield[]}
        productCopy={productCopy}
      />
      <AnimatedHeading productCopy={productCopy} />
      <ProductHistory productCopy={productCopy} />
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

function ProductHero({
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
    }),
    [],
  );

  return (
    <section className="flex flex-col items-center justify-center w-full max-h-full h-[80vh] mx-auto overflow-hidden -z-20">
      <div className="flex flex-col items-start justify-center relative w-full h-full overflow-hidden">
        <h1 className="inline-flex whitespace-nowrap mb-5 animate-carousel">
          {/* First set of titles */}
          <span className="block overflow-hidden">
            {[...Array(1)].map((_, i) => (
              <animated.span
                style={textSprings}
                key={i}
                className="inline-block text-[200px] text-transparent bg-clip-text bg-gradient-to-br from-stone-900 via-zinc-500 to-gray-800 bg-[size:200%_200%] font-display font-normal mx-5 animate-bg-rotate -z-20"
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
                className="inline-block text-[200px] text-transparent bg-clip-text bg-gradient-to-br from-slate-900 via-gray-500 to-neutral-800 bg-[size:200%_200%] font-display font-normal mx-5 animate-bg-rotate -z-20"
              >
                {title}
              </animated.span>
            ))}
          </span>
        </h1>
        <div className="block overflow-hidden">
          <animated.h2 style={textSprings} className="my-0">
            <Money
              className="text-6xl"
              data={
                selectedVariant?.price ?? {amount: '0', currencyCode: 'EUR'}
              }
            />
          </animated.h2>
        </div>
      </div>
    </section>
  );
}

function ProductDescription({
  metafields,
  productCopy,
}: {
  metafields: Metafield[];
  productCopy: ProductCopy | null;
}) {
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
      const startThreshold = 0.1; // Keep the start point
      const endThreshold = 0.2; // NEW: Define the animation end point

      // Check if we are within the animation range [0.2, 0.3]
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

  const paintingLocation: string | undefined = metafields.find(
    (metafield) => metafield?.key === 'painting_location',
  )?.value;
  const style: string | undefined = metafields.find(
    (metafield) => metafield?.key === 'style',
  )?.value;
  const medium: string | undefined = metafields.find(
    (metafield) => metafield?.key === 'medium',
  )?.value;
  const year: string | undefined = metafields.find(
    (metafield) => metafield?.key === 'year',
  )?.value;
  const artist: string | undefined = metafields.find(
    (metafield) => metafield?.key === 'artist',
  )?.value;

  return (
    <div className="flex items-center justify-between w-full my-[100px] overflow-y-auto relative">
      {/* Ensure content inside is taller than h-[500px] to allow scrolling */}
      <div className="flex flex-col gap-5 max-w-[35%]">
        <h2 className="block relative text-7xl font-display tracking-tighter overflow-hidden">
          <animated.span style={textSprings} className="inline-block">
            {productCopy?.['description-section']['concise-heading']}
          </animated.span>
        </h2>
        <p className="text-lg tracking-wide text-pretty overflow-hidden">
          <animated.span style={textSprings} className="inline-block">
            {productCopy?.['description-section']['concise-description']}
          </animated.span>
        </p>
      </div>
      <div className="max-w-[35%] w-full">
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
}

function AnimatedHeading({productCopy}: {productCopy: ProductCopy | null}) {
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
      const startThreshold = 0.25;
      const endThreshold = 0.35;

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
    <section className="relative bg-white flex items-center justify-center w-full h-full my-72 z-[1]">
      <h2 className="flex items-center justify-center text-8xl font-display tracking-tighter overflow-hidden">
        <animated.span
          style={textSprings}
          className="inline-block max-w-3/5 mx-auto text-center "
        >
          {productCopy?.['animated-heading']}
        </animated.span>
      </h2>
    </section>
  );
}

function ProductHistory({productCopy}: {productCopy: ProductCopy | null}) {
  return (
    <>
      {/* Parallax History Section */}
      <section className="relative w-11/12 mx-auto h-[85vh] sticky top-0 mt-10 z-10">
        <Parallax
          pages={4}
          className="absolute top-0 left-0 w-full h-full bg-zinc-900 border-[1px] border-zinc-700 rounded-lg overflow-hidden [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-zinc-800 [&::-webkit-scrollbar-thumb]:bg-zinc-500 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-zinc-800 [&::-webkit-scrollbar-thumb:hover]:bg-zinc-400 scrollbar-thin scrollbar-track-zinc-800 scrollbar-thumb-zinc-500"
        >
          {/* Heading - Section 1 */}
          <ParallaxLayer
            offset={0}
            speed={0.2}
            factor={1}
            className="flex items-center justify-center"
          >
            <div className="flex flex-col items-center justify-center max-w-[70%] w-full h-full px-5 py-5">
              <h2 className="text-7xl font-display tracking-tighter text-center mb-12 overflow-hidden text-gray-100">
                {productCopy?.['history-section']['heading']}
              </h2>
            </div>
          </ParallaxLayer>

          {/* First Block - Section 2 */}
          <ParallaxLayer
            offset={1}
            speed={0.1}
            factor={1}
            className="flex items-center justify-start px-20"
          >
            <div className="flex flex-col items-center justify-center max-w-1/3 w-full h-full">
              <h3 className="w-full text-5xl font-display text-left tracking-tighter mb-10 pb-2 overflow-hidden text-gray-200">
                History
              </h3>
              <p className="text-2xl tracking-wide leading-relaxed text-pretty overflow-hidden text-gray-300">
                {productCopy?.['history-section']['first-block']['text-block']}
              </p>
            </div>
          </ParallaxLayer>

          <ParallaxLayer
            offset={1}
            speed={0.3}
            factor={1}
            className="flex items-center justify-end px-20"
          >
            <div className="flex flex-col items-center justify-center max-w-7/12 w-6/12 max-h-[700px] h-full">
              <Image
                src={
                  productCopy?.['history-section']['first-block']['image_url']
                }
                alt="Product Image"
                className="max-w-full w-full max-h-full h-full object-cover rounded-lg"
              />
            </div>
          </ParallaxLayer>

          {/* Second Block - Section 3 */}
          <ParallaxLayer
            offset={2}
            speed={0.1}
            factor={1}
            className="flex items-center justify-end px-20"
          >
            <div className="flex flex-col items-center justify-center max-w-1/3 w-full h-full">
              <h3 className="w-full text-5xl font-display text-left tracking-tighter mb-10 pb-2 overflow-hidden text-gray-200">
                The Process
              </h3>
              <p className="text-2xl tracking-wide leading-relaxed text-pretty overflow-hidden text-gray-300">
                {productCopy?.['history-section']['second-block']['text-block']}
              </p>
            </div>
          </ParallaxLayer>

          <ParallaxLayer
            offset={2}
            speed={0.3}
            factor={1}
            className="flex items-center justify-start px-20"
          >
            <div className="flex items-center justify-center max-w-7/12 w-6/12 max-h-[700px] h-full">
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
            offset={3}
            speed={0.1}
            factor={1}
            className="flex items-center justify-start px-20"
          >
            <div className="flex flex-col items-center justify-center max-w-1/3 w-full h-full">
              <h3 className="w-full text-5xl font-display text-left tracking-tighter mb-10 pb-2 overflow-hidden text-gray-200">
                More History
              </h3>
              <p className="text-2xl tracking-wide leading-relaxed text-pretty overflow-hidden text-gray-300">
                {productCopy?.['history-section']['third-block']['text-block']}
              </p>
            </div>
          </ParallaxLayer>

          <ParallaxLayer
            offset={3}
            speed={0.3}
            factor={1}
            className="flex items-center justify-end px-20"
          >
            <div className="flex items-center justify-center max-w-7/12 w-6/12 max-h-[700px] h-full">
              <Image
                src={
                  productCopy?.['history-section']['third-block']['image_url']
                }
                alt="Product Image"
                className="max-w-full w-full max-h-full h-full object-contain rounded-4xl"
              />
            </div>
          </ParallaxLayer>
        </Parallax>
      </section>
    </>
  );
}

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
