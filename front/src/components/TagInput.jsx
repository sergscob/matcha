import { useState } from "react";

import { api } from "../api/client";

function normalize(tag) {
  return tag.trim().toLowerCase().replace(/^#/, "");
}

export function TagInput({ tags, onChange }) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  async function handleInputChange(e) {
    const value = e.target.value;
    setInput(value);

    if (value.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const results = await api.get(`/profile/tags?search=${encodeURIComponent(normalize(value))}`);
      setSuggestions(results.filter(tag => !tags.includes(tag)));
    } catch {
      setSuggestions([]);
    }
  }

  function addTag(rawTag) {
    const tag = normalize(rawTag);

    if (tag && !tags.includes(tag)) {
      onChange([...tags, tag]);
    }

    setInput("");
    setSuggestions([]);
  }

  function removeTag(tag) {
    onChange(tags.filter(t => t !== tag));
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    }
  }

  return (
    <div className="tag-input">
      <div className="tag-list">
        {tags.map(tag => (
          <span key={tag} className="tag-chip">
            #{tag}
            <button type="button" onClick={() => removeTag(tag)} aria-label={`Remove ${tag}`}>×</button>
          </span>
        ))}
      </div>

      <input
        type="text"
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Add an interest and press Enter (e.g. vegan)"
        autoComplete="off"
      />

      {suggestions.length > 0 && (
        <ul className="tag-suggestions">
          {suggestions.map(tag => (
            <li key={tag}>
              <button type="button" onClick={() => addTag(tag)}>#{tag}</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
