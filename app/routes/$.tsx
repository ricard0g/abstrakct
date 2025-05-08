import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';
import { Link } from '@remix-run/react';

export async function loader({request}: LoaderFunctionArgs) {
  console.log("[LOADER] Splat route ($) hit!");
  return null; // Or throw a new Response("Not Found from Splat", { status: 404 });
}

export default function SplatRoute() {
  console.log("[COMPONENT] SplatRoute rendering");
  return (
    <div>
      <h1>404 - Page Not Found (from $.tsx)</h1>
      <p>The page you're looking for doesn't seem to exist.</p>
      <Link to="/">Go Home</Link>
    </div>
  );
}
