import ProductGrid from './ProductGrid';

export default function SimpleExperience({products}: {products: any[]}) {
  return (
    <section>
      {products && <ProductGrid products={products} />}
    </section>
  );
}
