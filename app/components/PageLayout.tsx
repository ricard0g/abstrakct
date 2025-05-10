import {Await, Link} from '@remix-run/react';
import {Suspense, useId, Children, useState, useEffect} from 'react';
import type {
  CartApiQueryFragment,
  FooterQuery,
  HeaderQuery,
} from 'storefrontapi.generated';
import {Aside} from '~/components/Aside';
import {Footer} from '~/components/Footer';
import {Header, HeaderMenu} from '~/components/Header';
import {CartMain} from '~/components/CartMain';
import {
  SEARCH_ENDPOINT,
  SearchFormPredictive,
} from '~/components/SearchFormPredictive';
import {SearchResultsPredictive} from '~/components/SearchResultsPredictive';
import Cursor from '~/components/Cursor';
import {
  useTrail,
  animated,
  useSpringRef,
  useChain,
  useSpring,
} from '@react-spring/web';
import {useStableIds} from '~/lib/hooks/useStableIds';
import {useResponsive} from '~/lib/hooks/useResponsive';

interface PageLayoutProps {
  cart: Promise<CartApiQueryFragment | null>;
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
  children?: React.ReactNode;
}

export function PageLayout({
  cart,
  children = null,
  footer,
  header,
  isLoggedIn,
  publicStoreDomain,
}: PageLayoutProps) {
  const [introState, setIntroState] = useState<
    'loading' | 'showing' | 'finished'
  >('loading');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasSeenIntro = sessionStorage.getItem('hasSeenIntro');
      // For development, force intro by uncommenting next line:
      // sessionStorage.removeItem('hasSeenIntro');
      if (!hasSeenIntro) {
        setIntroState('showing');
      } else {
        setIntroState('finished');
      }
    } else {
      // Fallback for SSR or environments without sessionStorage, assume intro is finished.
      setIntroState('finished');
    }
  }, []);

  // Prevent scrolling when intro is present
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (introState === 'loading' || introState === 'showing') {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
  }, [introState]);

  const handleIntroComplete = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('hasSeenIntro', 'true');
    }
    setIntroState('finished');
  };

  // Always render the main layout. Intro will be an overlay if 'showing'.
  return (
    <>
      <Aside.Provider>
        <CartAside cart={cart} />
        <SearchAside />
        <MobileMenuAside
          header={header}
          publicStoreDomain={publicStoreDomain}
        />
        {header && (
          <Header
            header={header}
            cart={cart}
            isLoggedIn={isLoggedIn}
            publicStoreDomain={publicStoreDomain}
          />
        )}
        <main>{children}</main>
        <Footer
          footer={footer}
          header={header}
          publicStoreDomain={publicStoreDomain}
        />
        <Cursor />
      </Aside.Provider>

      {/* Placeholder to cover content during initial loading/checking of intro status */}
      {introState === 'loading' && (
        <div
          className="fixed top-0 left-0 w-screen h-screen bg-zinc-900 z-[100]"
          aria-hidden="true"
        />
      )}

      {/* Conditionally render Intro as an overlay */}
      {introState === 'showing' && <Intro onComplete={handleIntroComplete} />}
    </>
  );
}

function CartAside({cart}: {cart: PageLayoutProps['cart']}) {
  return (
    <Aside type="cart" heading="CART">
      <Suspense fallback={<p>Loading cart ...</p>}>
        <Await resolve={cart}>
          {(cart) => {
            return <CartMain cart={cart} layout="aside" />;
          }}
        </Await>
      </Suspense>
    </Aside>
  );
}

function SearchAside() {
  const queriesDatalistId = useId();
  return (
    <Aside type="search" heading="SEARCH">
      <div className="predictive-search">
        <br />
        <SearchFormPredictive>
          {({fetchResults, goToSearch, inputRef}) => (
            <>
              <input
                name="q"
                onChange={fetchResults}
                onFocus={fetchResults}
                placeholder="Search"
                ref={inputRef}
                type="search"
                list={queriesDatalistId}
              />
              &nbsp;
              <button onClick={goToSearch}>Search</button>
            </>
          )}
        </SearchFormPredictive>

        <SearchResultsPredictive>
          {({items, total, term, state, closeSearch}) => {
            const {articles, collections, pages, products, queries} = items;

            if (state === 'loading' && term.current) {
              return <div>Loading...</div>;
            }

            if (!total) {
              return <SearchResultsPredictive.Empty term={term} />;
            }

            return (
              <>
                <SearchResultsPredictive.Queries
                  queries={queries}
                  queriesDatalistId={queriesDatalistId}
                />
                <SearchResultsPredictive.Products
                  products={products}
                  closeSearch={closeSearch}
                  term={term}
                />
                <SearchResultsPredictive.Collections
                  collections={collections}
                  closeSearch={closeSearch}
                  term={term}
                />
                <SearchResultsPredictive.Pages
                  pages={pages}
                  closeSearch={closeSearch}
                  term={term}
                />
                <SearchResultsPredictive.Articles
                  articles={articles}
                  closeSearch={closeSearch}
                  term={term}
                />
                {term.current && total ? (
                  <Link
                    onClick={closeSearch}
                    to={`${SEARCH_ENDPOINT}?q=${term.current}`}
                  >
                    <p>
                      View all results for <q>{term.current}</q>
                      &nbsp; →
                    </p>
                  </Link>
                ) : null}
              </>
            );
          }}
        </SearchResultsPredictive>
      </div>
    </Aside>
  );
}

function MobileMenuAside({
  header,
  publicStoreDomain,
}: {
  header: PageLayoutProps['header'];
  publicStoreDomain: PageLayoutProps['publicStoreDomain'];
}) {
  return (
    header.menu &&
    header.shop.primaryDomain?.url && (
      <Aside type="mobile" heading="MENU">
        <HeaderMenu
          menu={header.menu}
          viewport="mobile"
          primaryDomainUrl={header.shop.primaryDomain.url}
          publicStoreDomain={publicStoreDomain}
        />
      </Aside>
    )
  );
}

function Intro({onComplete}: {onComplete: () => void}) {
  const {isMobile} = useResponsive();
  const trail1Ref = useSpringRef();
  const trail2Ref = useSpringRef();
  const trail3Ref = useSpringRef();
  const trail4Ref = useSpringRef();
  const trail5Ref = useSpringRef();
  const trail6Ref = useSpringRef();
  const trail7Ref = useSpringRef();
  const trail8Ref = useSpringRef();

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
    [0, 0.4, 0.65, 0.85, 1.0, 1.2, 1.4, 2.4], // Timings
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
        delay: 1000, // Delay before setting display to none
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
      className={`fixed top-0 left-0 w-screen h-screen flex flex-col justify-center gap-y-8 bg-zinc-900 items-center z-[100] transition-all duration-500 overflow-hidden`} // Ensure high z-index
      style={{perspective: '1200px', ...props2}}
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
          className="inline-block text-5xl md:text-7xl xl:text-8xl md:-mx-0.5"
          key={ids[index]}
          style={{
            ...props,
            ...styles,
          }}
        >
          {items[index]}
        </animated.span>
      ))}
    </p>
  );
}
