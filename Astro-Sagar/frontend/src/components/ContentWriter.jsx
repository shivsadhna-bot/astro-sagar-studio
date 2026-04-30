import React, { useEffect, useRef, useState } from "react";
import { supabase } from "../supabase";

const ContentWriter = () => {
  const [scripts, setScripts] = useState([]);
  const [selectedScript, setSelectedScript] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [displayText, setDisplayText] = useState("");
  const typingRef = useRef(null);

  useEffect(() => {
    fetchScripts();
  }, []);

  const fetchScripts = async () => {
    const { data } = await supabase
      .from("scripts")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setScripts(data);
  };

  // 🔥 FIXED GENERATE
  const handleGenerate = async () => {
    if (!input.trim()) return;

    try {
      setLoading(true);

      const res = await fetch("http://127.0.0.1:8000/generate-agents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic: input }),
      });

      const data = await res.json();

      const inserts = (data.results || []).map((item) => ({
  agent_name: item.agent_name,
  topic: item.topic,
  script: item.script,
}));

console.log("Saving:", inserts);

// 🔥 ACTUAL SAVE
const { data: savedData, error } = await supabase
  .from("scripts")
  .insert(inserts)
  .select();

if (error) {
  console.log("Save error:", error);
} else {
  console.log("Saved:", savedData);

  // 🔥 show instantly
  if (savedData.length > 0) {
    setSelectedScript(savedData[0]);
  }
}

      // 🔥 AUTO SHOW FIRST RESULT
      if (inserts.length > 0) {
        setSelectedScript(inserts[0]);
      }

      setInput("");
      fetchScripts();

    } catch (err) {
      console.log("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 DELETE
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Delete this script?");
    if (!confirmDelete) return;

    await supabase.from("scripts").delete().eq("id", id);
    fetchScripts();

    if (selectedScript?.id === id) setSelectedScript(null);
  };

  // 🔥 TYPING EFFECT
  useEffect(() => {
    if (!selectedScript) return;

    let i = 0;
    const text = selectedScript.script || "";

    clearInterval(typingRef.current);
    setDisplayText("");

    typingRef.current = setInterval(() => {
      i++;
      setDisplayText(text.slice(0, i));

      if (i >= text.length) clearInterval(typingRef.current);
    }, 8);

    return () => clearInterval(typingRef.current);
  }, [selectedScript]);

  return (
    <div className="flex w-full h-screen bg-white">

      {/* 🔹 Sidebar */}
      <div
  className="w-[260px] bg-gray-200 border-r p-4 overflow-y-auto"
  style={{ color: "#000", opacity: 1 }}
>
  <h2 className="font-semibold mb-4" style={{ color: "#000" }}>
    Content History
  </h2>

  {scripts.length === 0 && (
    <p style={{ color: "red" }}>No data found</p>
  )}

  {scripts.map((item) => (
    <div
      key={item.id}
      className={`p-3 rounded-lg mb-2 relative ${
        selectedScript?.id === item.id
          ? "bg-gray-300"
          : "hover:bg-gray-100"
      }`}
    >
      <div onClick={() => setSelectedScript(item)}>
        <p
          className="font-semibold text-sm truncate"
          style={{ color: "#000" }}
        >
          {item.topic}
        </p>

        <span style={{ color: "#333" }} className="text-xs">
          {item.agent_name}
        </span>
      </div>

      <button
        onClick={() => handleDelete(item.id)}
        className="absolute right-2 top-2 text-gray-500 hover:text-red-500"
      >
        ⋮
      </button>
    </div>
  ))}
</div>
      {/* 🔹 Main */}
      <div className="flex-1 flex flex-col">

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">

          {!selectedScript ? (
            <p className="text-gray-500 text-center mt-20">
              Select a script from history
            </p>
          ) : (
            <div className="max-w-3xl mx-auto">
              <h2 className="text-black text-xl font-semibold mb-2">
                {selectedScript.topic}
              </h2>

              <p className="text-gray-600 text-xs mb-4">
                {selectedScript.agent_name}
              </p>

              <p className="text-black whitespace-pre-wrap leading-relaxed">
                {displayText}
              </p>
            </div>
          )}

        </div>

        {/* 🔥 Input */}
        <div className="fixed bottom-0 left-[260px] right-0 bg-white border-t px-6 py-4">
          <div className="max-w-3xl mx-auto flex gap-3">

 <input
  value={input}
  onChange={(e) => setInput(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter") handleGenerate();
  }}
  placeholder="Write your prompt..."
  style={{ color: "black", backgroundColor: "white" }}
  className="flex-1 p-3 rounded-xl border border-gray-300"
/>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="bg-black text-white px-6 py-3 rounded-xl"
            >
              {loading ? "Generating..." : "⚡ Generate"}
            </button>

          </div>
        </div>

      </div>
    </div>
  );
};

export default ContentWriter;