import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData, type MetaFunction} from '@remix-run/react';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {ProductImage} from '~/components/ProductImage';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
import {useCallback, useMemo, Suspense} from 'react';
import {Await} from '@remix-run/react';
import type {Product, Metafield} from '@shopify/hydrogen/storefront-api-types';
import { ProductHero } from '~/components/ProductHero';
import { ProductDescription } from '~/components/ProductDescription';
import { ProductCopy } from '~/lib/types/productTypes';
import {AnimatedHeading} from '~/components/AnimatedHeading';
import {ProductHistory} from '~/components/ProductHistory';
import {YouMayAlsoLike} from '~/components/YouMayAlsoLike';

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
      if (!product || !product.product) {
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

  if (!recommendedProducts) {
    throw new Error('Expected recommended products to be defined');
  }

  return {
    recommendedProducts,
  };
}

export default function Product() {
  const {product, recommendedProducts} = useLoaderData<typeof loader>();

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
      <Suspense fallback={<div>Loading recommended products...</div>}>
        <Await resolve={recommendedProducts}>
          {(data) => <YouMayAlsoLike recommendedProducts={data?.productRecommendations || []} />}
        </Await>
      </Suspense>
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
