import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {Await, useLoaderData, Link, type MetaFunction} from '@remix-run/react';
import {Children, Suspense} from 'react';
import {Image} from '@shopify/hydrogen';
import type {
  FeaturedCollectionFragment,
  RecommendedProductsQuery,
} from 'storefrontapi.generated';
import ProductItem from '~/components/ProductItem';
import {useInView, animated, useTrail} from '@react-spring/web';
import {useStableIds} from '~/lib/hooks/useStableIds';

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
    featuredCollection1: collections.nodes[0],
    featuredCollection2: collections.nodes[1],
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

  // Intro logic is now handled by PageLayout.tsx
  // Render the main content of the homepage directly.
  return (
    <div className="home">
      <FeaturedCollection
        firstCollection={data.featuredCollection1}
        secondCollection={data.featuredCollection2}
      />
      <RecommendedProducts products={data.recommendedProducts} />
      <CoolText />
    </div>
  );
}

function FeaturedCollection({
  firstCollection,
  secondCollection,
}: {
  firstCollection: FeaturedCollectionFragment;
  secondCollection: FeaturedCollectionFragment;
}) {
  if (!firstCollection || !secondCollection) return null;
  const firstImage = firstCollection?.image;
  const secondImage = secondCollection?.image;
  return (
    <div className="flex flex-row justify-center items-center gap-x-2 md:max-h-[80vh] md:min-h-[80vh] h-full md:h-screen w-full mb-2 md:mb-10">
      <Link
        className="flex flex-col items-center justify-center w-full md:max-h-screen h-full"
        to={`/collections/${firstCollection.handle}`}
      >
        {firstImage && (
          <div className="max-w-full w-full max-h-full h-full">
            <Image
              data={firstImage}
              className="max-w-full max-h-full w-full h-full object-cover"
              sizes="100vw"
            />
          </div>
        )}
        <h1 className="font-display text-start my-2">
          {firstCollection.title}
        </h1>
      </Link>
      <Link
        className="hidden md:flex flex-col items-center justify-center w-full max-h-screen h-full"
        to={`/collections/${secondCollection.handle}`}
      >
        {secondImage && (
          <div className="max-w-full w-full max-h-full h-full">
            <Image
              data={secondImage}
              className="max-w-full max-h-full w-full h-full object-cover"
              sizes="100vw"
            />
          </div>
        )}
        <h1 className="font-display text-start my-2">
          {secondCollection.title}
        </h1>
      </Link>
    </div>
  );
}

function RecommendedProducts({
  products,
}: {
  products: Promise<RecommendedProductsQuery | null>;
}) {
  return (
    <div className="recommended-products">
      <h2 className="text-lg md:text-xl font-display">Recommended Products</h2>
      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={products}>
          {(response) => (
            <div className="recommended-products-grid">
              {response
                ? response.products.nodes.map((product) => (
                    <ProductItem
                      key={product.id}
                      product={product}
                      image={product.images.nodes[0]}
                    />
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

function CoolText() {
  return (
    <div className="flex flex-row justify-center items-center h-full w-full">
      <Trail>
        <span>A</span>
        <span>b</span>
        <span>s</span>
        <span>t</span>
        <span>r</span>
        <span>a</span>
        <span>k</span>
        <span>c</span>
        <span>t</span>
      </Trail>
    </div>
  );
}

function Trail({children}: {children: React.ReactNode}) {
  const [ref, inView] = useInView({
    amount: 0.5,
  });
  const items = Children.toArray(children);
  const trail = useTrail(items.length, {
    from: {
      rotateY: -180,
    },
    to: {
      rotateY: inView ? 0 : -180,
    },
    config: {
      mass: 1,
      tension: 420,
      friction: 32,
    },
  });
  const ids = useStableIds(items.length);

  return (
    <h1 ref={ref} className="font-display text-start my-8 md:m-0">
      {trail.map((props, index) => (
        <animated.span
          key={ids[index]}
          style={{
            ...props,
            textTransform: 'uppercase',
          }}
          className="inline-block text-zinc-800 text-[16.1vw] sm:text-[16.8vw] md:text-[16.9vw]"
        >
          {items[index]}
        </animated.span>
      ))}
    </h1>
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
    collections(first: 2, sortKey: UPDATED_AT, reverse: true) {
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
    description
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
