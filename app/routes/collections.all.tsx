import {
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
} from '@shopify/remix-oxygen';
import {useFetcher, useLoaderData, type MetaFunction} from '@remix-run/react';
import {getPaginationVariables} from '@shopify/hydrogen';
import ProductGrid from '~/components/ProductGrid';

export const meta: MetaFunction<typeof loader> = () => {
  return [{title: `Abstrakct | Products`}];
};

export async function loader(args: LoaderFunctionArgs) {
  const {request, context} = args;
  const {storefront} = context;
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const filters = [];

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
async function loadCriticalData({context, request}: LoaderFunctionArgs) {
  const {storefront} = context;

  const paginationVariables = getPaginationVariables(request, {
    pageBy: 6,
  });

  const [{collection: collectionData}, {collection: facetsData}] =
    await Promise.all([
      storefront.query(ALL_PRODUCTS_QUERY_PAGINATED, {
        variables: paginationVariables,
      }),
      storefront.query(FACETS_QUERY),
    ]);

  if (!collectionData) {
    throw new Response('Not Found', {status: 404});
  }

  console.log(facetsData?.products.filters);

  return {
    facets: facetsData?.products.filters,
    productsPaginated: collectionData.products,
  };
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
  const {productsPaginated, facets} = useLoaderData<typeof loader>();

  return (
    <div className="collection">
      <h1>Products</h1>
      <ProductGrid connection={productsPaginated} />
    </div>
  );
}

function FilterProducts() {
  const fetcher = useFetcher();

  return (
    <div>
      <span>Filter:</span>
      <fetcher.Form method="GET"></fetcher.Form>
    </div>
  );
}

const FACETS_QUERY = `#graphql
  query getAllFacets {
    collection(handle: "all") {
      products(first: 1) {
        filters {
          id
          label
          type
          values {
            id
            label
            count
            input
          }
        }
      }
    }
  }
`;

const ALL_PRODUCTS_QUERY_PAGINATED = `#graphql
  query getAllProductsPaginated($first: Int, $last: Int, $startCursor: String, $endCursor: String) {
    collection(handle: "all") {
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
            maxVariantPrice {
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
  }
`;

// const ALL_PRODUCTS_QUERY_PAGINATED = `#graphql
//   query getAllProductsPaginated($first: Int, $last: Int, $startCursor: String, $endCursor: String) {
//     products(first: $first, last: $last, before: $startCursor, after: $endCursor) {
//       nodes {
//           description
//           featuredImage {
//             altText
//             id
//             url
//             height
//             width
//           }
//           handle
//           id
//           title
//           priceRange {
//             minVariantPrice {
//               amount
//               currencyCode
//             }
//             maxVariantPrice {
//               amount
//               currencyCode
//             }
//         }
//       }
//       pageInfo {
//         hasNextPage
//         hasPreviousPage
//         startCursor
//         endCursor
//       }
//     }
//   }
// `;
