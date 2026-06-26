import { useState } from "react";

import { api } from "../api/client";

function normalize(tag) {
  return tag.trim().toLowerCase().replace(/^#/, "");
}

function parseTags(value) {
  return value ? value.split(",").map(normalize).filter(Boolean) : [];
}

export function TagFilterInput({ value, onChange }) {
  const tags = parseTags(value);
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  async function handleInputChange(e) {
    const text = e.target.value;
    setInput(text);
    setHighlightedIndex(-1);

    if (text.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const results = await api.get(`/profile/tags?search=${encodeURIComponent(normalize(text))}`);
      setSuggestions(results.filter(tag => !tags.includes(tag)));
    } catch {
      setSuggestions([]);
    }
  }

  function addTag(rawTag) {
    const tag = normalize(rawTag);

    if (tag && !tags.includes(tag)) {
      onChange([...tags, tag].join(","));
    }

    setInput("");
    setSuggestions([]);
    setHighlightedIndex(-1);
  }

  function removeTag(tag) {
    onChange(tags.filter(t => t !== tag).join(","));
  }

  function handleKeyDown(e) {
    if (e.key === "ArrowDown" && suggestions.length > 0) {
      e.preventDefault();
      setHighlightedIndex(i => (i + 1) % suggestions.length);
      return;
    }

    if (e.key === "ArrowUp" && suggestions.length > 0) {
      e.preventDefault();
      setHighlightedIndex(i => (i <= 0 ? suggestions.length - 1 : i - 1));
      return;
    }

    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();

      const match = highlightedIndex >= 0
        ? suggestions[highlightedIndex]
        : suggestions.find(tag => tag === normalize(input));
      if (match) addTag(match);
    }
  }

  return (
    <div className="tag-input">
      <div className="tag-list">
        {tags.map(tag => (
          <span key={tag} className="tag-chip">
            <span className="tag-chip-label">#{tag}</span>
            <button className="tag-chip-close" type="button" onClick={() => removeTag(tag)} aria-label={`Remove ${tag}`}>×</button>
          </span>
        ))}
      </div>

      <input
        type="text"
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Add an interest..."
        autoComplete="off"
        maxLength={30}
      />

      {suggestions.length > 0 && (
        <ul className="tag-suggestions">
          {suggestions.map((tag, index) => (
            <li key={tag}>
              <button
                type="button"
                className={index === highlightedIndex ? "active" : undefined}
                onMouseEnter={() => setHighlightedIndex(index)}
                onClick={() => addTag(tag)}
              >
                #{tag}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
