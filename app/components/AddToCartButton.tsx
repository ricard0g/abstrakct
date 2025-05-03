import {useNavigate, type FetcherWithComponents} from '@remix-run/react';
import {CartForm, type OptimisticCartLineInput} from '@shopify/hydrogen';
import {useAside} from './Aside';
import {useState} from 'react';
import {useScroll} from '@react-spring/web';

export function AddToCartButton({
  analytics,
  children,
  disabled,
  lines,
  onClick,
}: {
  analytics?: unknown;
  children: React.ReactNode;
  disabled?: boolean;
  lines: Array<OptimisticCartLineInput>;
  onClick?: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[2]">
      <CartForm
        route="/cart"
        inputs={{lines}}
        action={CartForm.ACTIONS.LinesAdd}
      >
        {(fetcher: FetcherWithComponents<any>) => (
          <>
            <input
              name="analytics"
              type="hidden"
              value={JSON.stringify(analytics)}
            />
            <button
              type="submit"
              onClick={onClick}
              disabled={disabled ?? fetcher.state !== 'idle'}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className={`
                relative overflow-hidden px-8 py-3 text-lg font-medium tracking-wide
                ${disabled ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-black text-white'}
                rounded-full shadow-md transition-all duration-300 ease-in-out
                hover:shadow-lg hover:scale-105 active:scale-95
                before:absolute before:inset-0 before:w-full before:h-full before:bg-gradient-to-r
                before:from-zinc-600 before:via-gray-800 before:to-stone-900
                before:origin-left before:scale-x-0 before:transition-transform before:duration-500
                ${isHovered && !disabled ? 'before:scale-x-100' : ''}
              `}
            >
              <span className="relative z-10">{children}</span>
              {fetcher.state !== 'idle' && (
                <span className="absolute inset-0 flex items-center justify-center z-20 bg-black/10 backdrop-blur-sm">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </span>
              )}
            </button>
          </>
        )}
      </CartForm>
    </div>
  );
}
