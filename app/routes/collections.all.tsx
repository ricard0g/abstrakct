import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData, Link, type MetaFunction, Await} from '@remix-run/react';
import {getPaginationVariables, Image, Money} from '@shopify/hydrogen';
import type {ProductItemFragment} from 'storefrontapi.generated';
import {useVariantUrl} from '~/lib/variants';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {Suspense} from 'react';
import ProductGrid from '~/components/ProductGrid';
import {Product} from '@shopify/hydrogen/storefront-api-types';

export const meta: MetaFunction<typeof loader> = () => {
  return [{title: `Abstrakct | Products`}];
};

export async function loader(args: LoaderFunctionArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  console.log('Critical Data', criticalData);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context, request}: LoaderFunctionArgs) {
  const {storefront} = context;
  // const paginationVariables = getPaginationVariables(request, {
  //   pageBy: 8,
  // });
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 6,
  });

  const [{products: nonPaginatedProducts}, {products: paginatedProducts}] = await Promise.all([
    storefront.query(ALL_PRODUCTS_QUERY_NON_PAGINATED, {
      variables: {
        first: 12,
      },
    }),
    storefront.query(ALL_PRODUCTS_QUERY_PAGINATED, {
      variables: paginationVariables,
    }),
  ]);

  console.log('Products Paginated From Collection', paginatedProducts);

  return {products: nonPaginatedProducts.nodes, productsPaginated: paginatedProducts};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: LoaderFunctionArgs) {
  return {};
}

export default function Collection() {
  const {products, productsPaginated} = useLoaderData<typeof loader>();

  console.log('Products Paginated From Collection', productsPaginated);

  return (
    <div className="collection">
      <h1>Products</h1>
      {/* <PaginatedResourceSection
        connection={products}
        resourcesClassName="products-grid"
      >
        {({node: product, index}) => (
          <ProductItem
            key={product.id}
            product={product}
            loading={index < 8 ? 'eager' : undefined}
          />
        )}
      </PaginatedResourceSection> */}
      <Suspense fallback={<Loading />}>
        <Await resolve={products}>
          {(products) => <ProductGrid products={products} />}
        </Await>
      </Suspense>
    </div>
  );
}

function Loading() {
  return (
    <div>
      <h1 className="text-black">Loading...</h1>
    </div>
  );
}

function ProductItem({
  product,
  loading,
}: {
  product: ProductItemFragment;
  loading?: 'eager' | 'lazy';
}) {
  const variantUrl = useVariantUrl(product.handle);
  return (
    <Link
      className="product-item"
      key={product.id}
      prefetch="intent"
      to={variantUrl}
    >
      {product.featuredImage && (
        <Image
          alt={product.featuredImage.altText || product.title}
          aspectRatio="1/1"
          data={product.featuredImage}
          loading={loading}
          sizes="(min-width: 45em) 400px, 100vw"
        />
      )}
      <h4>{product.title}</h4>
      <small>
        <Money data={product.priceRange.minVariantPrice} />
      </small>
    </Link>
  );
}

const ALL_PRODUCTS_QUERY_PAGINATED = `#graphql
  query getAllProductsPaginated($first: Int, $last: Int, $startCursor: String, $endCursor: String) {
    products(first: $first, last: $last, before: $startCursor, after: $endCursor) {
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
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

const ALL_PRODUCTS_QUERY_NON_PAGINATED = `#graphql
  query getAllNonPaginatedProducts($first: Int) {
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
  }` as const;
