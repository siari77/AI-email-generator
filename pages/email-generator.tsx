import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import axios from "axios";

export default function EmailGenerator() {
  const { data: session } = useSession();
  const [description, setDescription] = useState("");
  const [tone, setTone] = useState("friendly");
  const [generatedEmail, setGeneratedEmail] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setGeneratedEmail(null);
    try {
      const res = await axios.post("/api/email/generate", { description, tone });
      setGeneratedEmail(res.data.email);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!session) return <button onClick={() => signIn()}>Sign in to continue</button>;

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "2rem" }}>
      <h1>Email Generator</h1>
      <p>Credits remaining: {session.user.credits}</p>
      <textarea
        placeholder="Describe your email..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={{ width: "100%", height: 100, marginBottom: 10 }}
      />
      <select value={tone} onChange={(e) => setTone(e.target.value)} style={{ marginBottom: 10 }}>
        <option value="friendly">Friendly</option>
        <option value="professional">Professional</option>
        <option value="urgent">Urgent</option>
        <option value="funny">Funny</option>
      </select>
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? "Generating..." : "Generate Email"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {generatedEmail && (
        <div style={{ marginTop: 20 }}>
          <h3>Email Body</h3>
          <p>{generatedEmail.body}</p>
          <h4>Suggested Subject Lines</h4>
          <ul>
            {generatedEmail.subjectLines.map((line: string, idx: number) => (
              <li key={idx}>{line}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
