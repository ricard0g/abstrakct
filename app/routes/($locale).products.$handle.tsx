import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData, type MetaFunction} from '@remix-run/react';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
  Money,
} from '@shopify/hydrogen';
import {ProductImage} from '~/components/ProductImage';
import {ProductForm} from '~/components/ProductForm';
import {animated, useSpring} from '@react-spring/web';
import {AddToCartButton} from '~/components/AddToCartButton';
import type {ProductVariant} from '@shopify/hydrogen/storefront-api-types';

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

  // Optimistically selects a variant with given available variant information
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  // Sets the search param to the selected variant without navigation
  // only when no search params are set in the url
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  // Get the product options array
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {title, metafields} = product;

  return (
    <div className="h-full z-0">
      <ProductImage image={selectedVariant?.image} />
      <ProductHero title={title} selectedVariant={selectedVariant} />
      <ProductDescription metafields={metafields} />
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
  selectedVariant: ProductVariant;
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
    <section className="flex flex-col items-center justify-center w-full max-h-full h-[90vh] mx-auto overflow-hidden -z-20">
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
            <Money className="text-6xl" data={selectedVariant.price} />
          </animated.h2>
        </div>
      </div>
    </section>
  );
}

function ProductDescription({metafields}: {metafields: Metafield[]}) {
  const productCopyMetafield = metafields.find(
    (metafield: Metafield) => metafield.key === 'product_copy',
  );

  const productCopy = productCopyMetafield?.value
    ? (JSON.parse(productCopyMetafield.value) as ProductCopy)
    : null;

  const paintingLocation: string | undefined = metafields.find(
    (metafield: Metafield) => metafield.key === 'painting_location',
  )?.value;
  const style: string | undefined = metafields.find(
    (metafield: Metafield) => metafield.key === 'style',
  )?.value;
  const medium: string | undefined = metafields.find(
    (metafield: Metafield) => metafield.key === 'medium',
  )?.value;
  const year: string | undefined = metafields.find(
    (metafield: Metafield) => metafield.key === 'year',
  )?.value;
  const artist: string | undefined = metafields.find(
    (metafield: Metafield) => metafield.key === 'artist',
  )?.value;

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <h2 className="text-4xl font-bold">
        {productCopy?.['description-section']['concise-heading']}
      </h2>
    </div>
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
