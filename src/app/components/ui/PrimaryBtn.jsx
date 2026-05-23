import Link from "next/link";

const PrimaryBtn = ({ href, title }) => {
  return (
    <Link
      href={href}
      className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
    >
      {title}
    </Link>
  );
};

export default PrimaryBtn;