import { useState } from "react";

import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import ListItem from '@tiptap/extension-list-item'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline';

import Toolbar from './Toolbar';
import './templates.css'

const paperSizes = {
  A4: { width: "210mm", height: "297mm" },
  Letter: { width: "216mm", height: "279mm" },
  Legal: { width: "216mm", height: "356mm" },
};

export default function NewTemplatePage() {

  const [paperSize, setPaperSize] = useState("A4");
  const [margins, setMargins] = useState({ top: "20mm", bottom: "20mm", left: "20mm", right: "20mm" });

  // Editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
        listItem: false,
      }),
      BulletList.configure(),
      OrderedList.configure(),
      ListItem.configure(),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Underline,
    ],
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam eu tortor mollis, pulvinar velit sit amet, egestas nisl. Ut varius molestie odio ac laoreet. Nulla in orci sollicitudin, iaculis mauris eu, sollicitudin sem. Ut consequat tellus et turpis tempor, et pellentesque dui porttitor. Maecenas at convallis enim, ut viverra sem. Vivamus pellentesque est sit amet sapien elementum vulputate. Mauris convallis augue in mattis fermentum. Pellentesque eu nisl in nulla molestie egestas vitae et nulla.',
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
      {editor && <Toolbar editor={editor} />}


      {/* Document Page with Dynamic Paper Size & Margins */}
      <div
        className="editor bg-white shadow-lg rounded-lg flex flex-col"
        style={{
          width: paperSizes[paperSize].width,
          height: paperSizes[paperSize].height,
          paddingTop: margins.top,
          paddingBottom: margins.bottom,
          paddingLeft: margins.left,
          paddingRight: margins.right,
        }}
      >
        <EditorContent editor={editor} className="editor__content flex-grow" />
      </div>
    </div>
  );
}