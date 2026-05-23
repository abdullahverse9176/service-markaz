import BlogForm from "../../_components/BlogForm";

export const metadata = {
  title: "Edit Blog Post | Admin",
};

export default async function EditBlogPage({ params }) {
  const { id } = await params;
  return <BlogForm blogId={id} />;
}
