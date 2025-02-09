/** @format */

import React, { useState } from "react";
import { MdAdd, MdClose} from "react-icons/md";

const TagInput = ({ tags, setTags }) => {
  const [inputValue, setinputValue] = useState("");
  const handleInputChange = (e) => {
    setinputValue(e.target.value);
  };

  const addNewTag = () => {
    if (inputValue.trim() !== "") {
      setTags([...tags, inputValue.trim()]);
      setinputValue("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      addNewTag();
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div>
      {tags?.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap mt-2">
          {tags.map((tag, index) => (
            <span key={index} className="flex items-center gap-2 text-sm text-slate-900 bg-slate-200 px-3 p-1 rounded">
              # {tag}
              <button
                onClick={() => {
                  handleRemoveTag(tag);
                }}
              >
                <MdClose />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-4 mt-3">
        <input
          type="text"
          value={inputValue}
          className="text-sm bg-transparent border border-gray-500 px-3 py-2 rounded outline-none"
          placeholder="Add Tags"
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />

        <button className="w-8 h-8 flex items-center justify-center rounded border border-violet-600 hover:bg-violet-600" 
        onClick={addNewTag}>
          <MdAdd className="text-2xl text-violet-600 hover:text-white" />
        </button>
      </div>
    </div>
  );
};

export default TagInput;
