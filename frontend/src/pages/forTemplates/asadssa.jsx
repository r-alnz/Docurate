import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import Blockquote from "@tiptap/extension-blockquote";
import TextAlign from "@tiptap/extension-text-align";
import CodeBlock from "@tiptap/extension-code-block";
import Highlight from "@tiptap/extension-highlight";

import Toolbar from "./Toolbar";

const paperSizes = {
  A4: { width: "210mm", height: "297mm" },
  Letter: { width: "216mm", height: "279mm" },
  Legal: { width: "216mm", height: "356mm" },
};

const NewTemplatePage = () => {
  const [paperSize, setPaperSize] = useState("A4");
  const [margins, setMargins] = useState({ top: "20mm", bottom: "20mm", left: "20mm", right: "20mm" });

  // Editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: false, // Disable built-in list
        orderedList: false, // Disable built-in list
      }),
      Underline,
      BulletList,
      OrderedList,
      ListItem,
      Blockquote,
      CodeBlock,
      Highlight,
      TextAlign.configure({ types: ["heading", "paragraph"] }), 
    ],
    content: "<p>Start writing your document here...</p>",
  });

  const handleMarginChange = (e) => {
    setMargins({ ...margins, [e.target.name]: e.target.value + "mm" });
  };

  if (!editor) {
    return <p>Loading editor...</p>;
  }

  return (
    <div className="flex flex-col items-center p-8 bg-gray-200 min-h-screen">
      <h1 className="text-xl font-bold mb-4">Create New Docudment</h1>

      {/* Paper Size Selector */}
      <label className="mb-2">Choose Paper Size:</label>
      <select
        value={paperSize}
        onChange={(e) => setPaperSize(e.target.value)}
        className="border p-2 rounded-md mb-4"
      >
        {Object.keys(paperSizes).map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>

      {/* Margin Inputs */}
      <div className="flex space-x-2 mb-4">
        {["top", "bottom", "left", "right"].map((side) => (
          <div key={side} className="flex flex-col items-center">
            <label>{side.charAt(0).toUpperCase() + side.slice(1)}</label>
            <input
              type="number"
              name={side}
              value={parseInt(margins[side])}
              onChange={handleMarginChange}
              className="w-16 border p-1 rounded-md"
            />
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <Toolbar editor={editor} />

      {/* Document Page with Dynamic Paper Size & Margins */}
      <div
        className="bg-white shadow-lg rounded-lg flex flex-col"
        style={{
          width: paperSizes[paperSize].width,
          height: paperSizes[paperSize].height,
          paddingTop: margins.top,
          paddingBottom: margins.bottom,
          paddingLeft: margins.left,
          paddingRight: margins.right,
        }}
      >
        <EditorContent editor={editor} className="flex-grow" />
      </div>
    </div>
  );
};

export default NewTemplatePage;