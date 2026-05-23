import { categories } from "@/data/categories";

export async function generateMetadata({ params }) {
  const { category } = await params;
  const categoryObj = categories.find((cat) => cat.slug === category);

  if (!categoryObj) {
    return { title: "Category Not Found | Service Markaz" };
  }

  const title = `${categoryObj.name} – Find ${categoryObj.name} Across Pakistan | Service Markaz`;
  const description =
    categoryObj.description ||
    `Find verified ${categoryObj.name.toLowerCase()} professionals across Pakistan. Compare ratings, read real reviews and contact trusted ${categoryObj.name.toLowerCase()} in your city — free on Service Markaz.`;

  return {
    title,
    description,
    keywords: [
      `${categoryObj.name.toLowerCase()} Pakistan`,
      `find ${categoryObj.name.toLowerCase()}`,
      `${categoryObj.name.toLowerCase()} near me`,
      `hire ${categoryObj.name.toLowerCase()} Pakistan`,
      `best ${categoryObj.name.toLowerCase()} service`,
      `${categoryObj.name.toLowerCase()} service providers`,
    ],
    alternates: { canonical: `/categories/${category}` },
    openGraph: {
      title,
      description,
      url: `/categories/${category}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function CategoryLayout({ children }) {
  return children;
}
