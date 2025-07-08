import Link from "next/link";

export default function Home() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Welcome to Your AI SaaS</h1>
      <Link href="/email-generator">
        <button>Go to Email Generator</button>
      </Link>
    </div>
  );
}
