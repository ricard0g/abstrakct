import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {Await, useLoaderData, Link, type MetaFunction} from '@remix-run/react';
import {Suspense, Children, useState, useEffect} from 'react';
import {Image, Money} from '@shopify/hydrogen';
import type {
  FeaturedCollectionFragment,
  RecommendedProductsQuery,
} from 'storefrontapi.generated';
import {
  useTrail,
  animated,
  useSpringRef,
  useChain,
  useSpring,
} from '@react-spring/web';
import {useStableIds} from '~/lib/hooks/useStableIds';
import {useResponsive} from '~/lib/hooks/useResponsive';
export type IndexLoader = typeof loader;

export const meta: MetaFunction = () => {
  return [{title: 'Abstrakct | Home'}];
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
async function loadCriticalData({context}: LoaderFunctionArgs) {
  // Simulate network delay
  // await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 seconds

  const [{collections}, {products}] = await Promise.all([
    context.storefront.query(FEATURED_COLLECTION_QUERY),
    context.storefront.query(ALL_PRODUCTS_QUERY, {
      variables: {
        first: 12,
      },
    }),
  ]);

  return {
    featuredCollection: collections.nodes[0],
    products: products.nodes,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: LoaderFunctionArgs) {
  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY)
    .catch((error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });

  return {
    recommendedProducts,
  };
}

export default function Homepage() {
  const data = useLoaderData<typeof loader>();
  const [showIntro, setShowIntro] = useState(false); //TODO: Set to false

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasSeenIntro = sessionStorage.getItem('hasSeenIntro');
      if (!hasSeenIntro) {
        setShowIntro(true);
      }
    }
  }, []);

  const handleIntroComplete = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('hasSeenIntro', 'true');
    }
    setShowIntro(false);
  };

  return <>{showIntro && <Intro onComplete={handleIntroComplete} />}</>;
 }

function Loading() {
  return (
    <div>
      <h1 className="text-black">Loading...</h1>
    </div>
  );
}

function Intro({onComplete}: {onComplete: () => void}) {
  //{onComplete}: {onComplete: () => void}
  const {isMobile} = useResponsive();
  const trail1Ref = useSpringRef();
  const trail2Ref = useSpringRef();
  const trail3Ref = useSpringRef();
  const trail4Ref = useSpringRef();
  const trail5Ref = useSpringRef();
  const trail6Ref = useSpringRef();
  const trail7Ref = useSpringRef();
  const trail8Ref = useSpringRef();

  // Define the sequence and timing for each trail animation
  // Timings are in seconds from the start of the chain
  useChain(
    [
      trail1Ref,
      trail2Ref,
      trail3Ref,
      trail4Ref,
      trail5Ref,
      trail6Ref,
      trail7Ref,
      trail8Ref,
    ],
    [0, 0.4, 0.65, 0.85, 1.0, 1.2, 1.4, 2.4],
  );

  const [props] = useSpring(() => ({
    ref: trail1Ref,
    from: {
      opacity: 0,
      y: 100,
    },
    to: {
      opacity: 1,
      y: 0,
    },
    config: {
      mass: 1,
      tension: 220,
      friction: 32,
    },
  }));

  const [props2] = useSpring(() => ({
    ref: trail8Ref,
    from: {
      transform: 'translateY(0)',
      display: 'flex',
    },
    to: [
      {
        transform: 'translateY(-100%)',
      },
      {
        display: 'none',
        delay: 1000,
      },
    ],
    onRest: () => {
      onComplete();
    },
    config: {
      mass: 1,
      tension: 220,
      friction: 32,
    },
  }));

  return (
    <animated.div
      className={`absolute top-0 left-0 w-screen h-screen flex flex-col justify-center gap-y-8 bg-zinc-900 items-center z-[51] transition-all duration-500`}
      style={{perspective: '1200px', ...props2}} // Props2 has to be here
    >
      <p className="block absolute top-1/12 md:top-2/12 font-display font-light tracking-tight text-gray-200">
        <animated.span
          style={{
            boxShadow:
              '0 8px 15px rgba(0, 0, 0, 0.2), 0 4px 6px rgba(0, 0, 0, 0.15), inset 0 2px 1px 1px rgba(255,255,255,0.07), inset 0 -2px 1px 1px rgba(0,0,0,0.2)',
            ...props,
          }}
          className="inline-block text-[24px] md:text-[32px] lg:text-[40px] bg-zinc-800 text-[#fafafa] font-semibold px-6 md:px-8 py-1 md:py-2 rounded-full border border-zinc-700 shadow-lg shadow-zinc-900 tracking-[0.01em]"
        >
          ABSTRAKCT
        </animated.span>
      </p>
      <div
        className={`flex ${isMobile ? 'flex-col items-center justify-center gap-y-5' : ''}`}
      >
        <Trail springRef={trail2Ref}>
          <span>W</span>
          <span>H</span>
          <span>E</span>
          <span>R</span>
          <span>E</span>
          <span>&nbsp;</span>
        </Trail>
        <Trail springRef={trail3Ref}>
          <span>A</span>
          <span>R</span>
          <span>T</span>
          <span>&nbsp;</span>
        </Trail>
        <Trail springRef={trail4Ref}>
          <span>T</span>
          <span>R</span>
          <span>A</span>
          <span>N</span>
          <span>S</span>
          <span>C</span>
          <span>E</span>
          <span>N</span>
          <span>D</span>
          <span>S</span>
        </Trail>
      </div>
      <Trail springRef={trail5Ref}>
        <span>A</span>
        <span>N</span>
        <span>D</span>
      </Trail>
      <div
        className={`flex ${isMobile ? 'flex-col items-center justify-center gap-y-5' : ''}`}
      >
        <Trail springRef={trail6Ref}>
          <span>V</span>
          <span>I</span>
          <span>S</span>
          <span>I</span>
          <span>O</span>
          <span>N</span>
          <span>&nbsp;</span>
        </Trail>
        <Trail springRef={trail7Ref}>
          <span>E</span>
          <span>N</span>
          <span>D</span>
          <span>U</span>
          <span>R</span>
          <span>E</span>
          <span>S</span>
        </Trail>
      </div>
    </animated.div>
  );
}

function Trail({
  children,
  styles,
  springRef,
}: {
  children: React.ReactNode;
  styles?: React.CSSProperties;
  springRef: ReturnType<typeof useSpringRef>;
}) {
  const items = Children.toArray(children);
  const trail = useTrail(items.length, {
    ref: springRef,
    from: {
      opacity: 0,
      rotateY: -180,
    },
    to: {
      opacity: 1,
      rotateY: 0,
    },
    config: {
      mass: 1,
      tension: 420,
      friction: 32,
    },
  });
  const ids = useStableIds(items.length);

  return (
    <p className="max-w-full font-display font-light tracking-tight text-gray-200">
      {trail.map((props, index) => (
        <animated.span
          className="inline-block text-5xl md:text-7xl xl:text-8xl  md:-mx-0.5"
          key={ids[index]}
          style={{
            ...props, // Apply all animated props (opacity, y, scale, rotateY)
            ...styles,
          }}
        >
          {items[index]}
        </animated.span>
      ))}
    </p>
  );
}

function FeaturedCollection({
  collection,
}: {
  collection: FeaturedCollectionFragment;
}) {
  if (!collection) return null;
  const image = collection?.image;
  return (
    <Link
      className="featured-collection"
      to={`/collections/${collection.handle}`}
    >
      {image && (
        <div className="featured-collection-image">
          <Image data={image} sizes="100vw" />
        </div>
      )}
      <h1>{collection.title}</h1>
    </Link>
  );
}

function RecommendedProducts({
  products,
}: {
  products: Promise<RecommendedProductsQuery | null>;
}) {
  return (
    <div className="recommended-products">
      <h2>Recommended Products</h2>
      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={products}>
          {(response) => (
            <div className="recommended-products-grid">
              {response
                ? response.products.nodes.map((product) => (
                    <Link
                      key={product.id}
                      className="recommended-product"
                      to={`/products/${product.handle}`}
                    >
                      <Image
                        data={product.images.nodes[0]}
                        aspectRatio="1/1"
                        sizes="(min-width: 45em) 20vw, 50vw"
                      />
                      <h4>{product.title}</h4>
                      <small>
                        <Money data={product.priceRange.minVariantPrice} />
                      </small>
                    </Link>
                  ))
                : null}
            </div>
          )}
        </Await>
      </Suspense>
      <br />
    </div>
  );
}

const FEATURED_COLLECTION_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    image {
      id
      url
      altText
      width
      height
    }
    handle
  }
  query FeaturedCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 1, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
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
    products(first: 4, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
` as const;

const ALL_PRODUCTS_QUERY = `#graphql
  query getProducts($first: Int) {
    products(first: $first) {
        nodes {
          description
          featuredImage {
            altText
            id
            url
            height
            width
          }
          handle
          id
          title
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
        }
      }
  }
`;
