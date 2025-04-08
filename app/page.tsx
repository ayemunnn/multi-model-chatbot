'use client';

import { useState } from "react";

export default function HomePage() {
  const [provider, setProvider] = useState<"openai" | "gemini">("openai");
  const [model, setModel] = useState("gpt-3.5-turbo");
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [responseOpenAI, setResponseOpenAI] = useState("");
  const [responseGemini, setResponseGemini] = useState("");
  const [loading, setLoading] = useState(false);
  const [compareMode, setCompareMode] = useState(false);

  const openaiModels = [
    "gpt-3.5-turbo",
    "gpt-3.5-turbo-0125",
    "gpt-4",
    "gpt-4-0125-preview",
    "gpt-4o"
  ];

  const geminiModels = [
    "gemini-pro",
    "gemini-1.5-pro-latest"
  ];

  const handleSubmit = async () => {
    setLoading(true);
    setResponse("");
    setResponseOpenAI("");
    setResponseGemini("");

    try {
      if (compareMode) {
        const [openaiRes, geminiRes] = await Promise.all([
          fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ provider: "openai", model: "gpt-3.5-turbo", prompt }),
          }),
          fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ provider: "gemini", model: "gemini-pro", prompt }),
          }),
        ]);

        const openaiData = await openaiRes.json();
        const geminiData = await geminiRes.json();

        setResponseOpenAI(openaiData.response);
        setResponseGemini(geminiData.response);
      } else {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ provider, model, prompt }),
        });

        const data = await res.json();
        setResponse(data.response);
      }
    } catch (err: any) {
      const errorMsg = "Error: " + err.message;
      if (compareMode) {
        setResponseOpenAI(errorMsg);
        setResponseGemini(errorMsg);
      } else {
        setResponse(errorMsg);
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-3xl mx-auto bg-gray-800 rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">🤖 Multi-Model Chatbot</h1>

        <div className="mb-4">
          <label className="block font-semibold mb-1">Select Provider:</label>
          <select
            className="w-full p-2 rounded bg-gray-700 text-white"
            value={provider}
            onChange={(e) => {
              const selected = e.target.value as "openai" | "gemini";
              setProvider(selected);
              setModel(selected === "openai" ? "gpt-3.5-turbo" : "gemini-pro");
            }}
          >
            <option value="openai">OpenAI</option>
            <option value="gemini">Gemini</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block font-semibold mb-1">Select Model:</label>
          <select
            className="w-full p-2 rounded bg-gray-700 text-white"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          >
            {(provider === "openai" ? openaiModels : geminiModels).map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="flex items-center gap-2 font-semibold">
            <input
              type="checkbox"
              checked={compareMode}
              onChange={() => setCompareMode(!compareMode)}
            />
            Compare OpenAI vs Gemini
          </label>
        </div>

        <div className="mb-4">
          <label className="block font-semibold mb-1">Your Prompt:</label>
          <textarea
            className="w-full p-3 h-32 rounded bg-gray-700 text-white"
            placeholder="Type your question or command here..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || !prompt.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate Response"}
        </button>

        {compareMode ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="p-4 bg-gray-700 rounded border border-gray-600">
              <h2 className="font-bold mb-2 text-lg">🤖 OpenAI</h2>
              <p className="whitespace-pre-wrap">{responseOpenAI}</p>
            </div>
            <div className="p-4 bg-gray-700 rounded border border-gray-600">
              <h2 className="font-bold mb-2 text-lg">🌈 Gemini</h2>
              <p className="whitespace-pre-wrap">{responseGemini}</p>
            </div>
          </div>
        ) : (
          response && (
            <div className="mt-6 p-4 bg-gray-700 rounded whitespace-pre-wrap border border-gray-600">
              <h2 className="font-semibold text-lg mb-2">Response:</h2>
              <p>{response}</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
