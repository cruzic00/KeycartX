// Port of app/c/[category]/page.tsx.
import { useParams } from "react-router-dom";
import ProductGrid from "../components/ProductGrid";

export default function DynamicCategoryPage() {
  const { category = "" } = useParams();
  const pretty = decodeURIComponent(category);
  const title = pretty.charAt(0).toUpperCase() + pretty.slice(1);

  return <ProductGrid category={pretty} title={`${title} Collection`} />;
}
