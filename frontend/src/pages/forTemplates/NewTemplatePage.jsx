import React from "react";
import { useState, useEffect, useRef } from "react";

import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';

import { Stack } from "@mui/material";
import PaginationExtension, { PageNode, HeaderFooterNode, BodyNode } from "tiptap-extension-pagination";

import Toolbar from './Toolbar';
import './templates.css';

const paperSizes = {
  A4: { width: "210mm", height: "297mm" },
  Letter: { width: "216mm", height: "279mm" },
  Legal: { width: "216mm", height: "356mm" },
};

export default function NewTemplatePage({ content, setContent, editable = true }) {

  const [paperSize, setPaperSize] = useState("A4");
  const [margins, setMargins] = useState({ top: "20mm", bottom: "20mm", left: "20mm", right: "20mm" });
  const [pages, setPages] = useState(["<p>Start typing...</p>"]);
    const editorRef = useRef(null);

    const extensions = [
        StarterKit,
        BulletList,
        OrderedList,
        ListItem,
        TextAlign.configure({ types: ['heading', 'paragraph'] }),
        Underline,
        PaginationExtension.configure({
            // pageHeight: 1056,
            // pageWidth: 816,
            // pageMargin: 96,
        }),
        PageNode,
        HeaderFooterNode,
        BodyNode
    ];

    const editor = useEditor({
        extensions,
        content,
        onUpdate: ({ editor }) => {
            setContent(editor.getHTML());
        },
        editable,
        onSelectionUpdate: ({ editor }) => {
            const { selection } = editor.state;
            console.log("Selection updated:", selection.from, selection.to);
        },
    });

    const handleMarginChange = (e) => {
      setMargins({ ...margins, [e.target.name]: e.target.value + "mm" });
    };

    useEffect(() => {
      if (editorRef.current) {
        editorRef.current.style.width = paperSizes[paperSize].width;
        editorRef.current.style.height = paperSizes[paperSize].height;
        // editorRef.current.scrollTop = 0;
    
        // Apply margins correctly
        editorRef.current.style.marginTop = margins.top;
        editorRef.current.style.marginBottom = margins.bottom;
        editorRef.current.style.marginLeft = margins.left;
        editorRef.current.style.marginRight = margins.right;
    
        // Keep editor centered inside document-container
        editorRef.current.style.display = "flex";
        // editorRef.current.style.alignItems = "center";
        editorRef.current.style.justifyContent = "center";
      }
    }, [paperSize, margins]);
    

    if (!editor) {
      return <p>Loading editor...</p>;
    }

    return (

    <div className="flex flex-col items-center p-8 bg-gray-200 min-h-screen">
      <h1 className="text-xl font-bold mb-4">Create New Document</h1>
      
      <label className="mb-2">Choose Paper Size:</label>
      <select
        value={paperSize}
        onChange={(e) => setPaperSize(e.target.value)}
        className="border p-2 rounded-md mb-4"
      >
        {Object.keys(paperSizes).map((size) => (
          <option key={size} value={size}>{size}</option>
        ))}
      </select>

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

      {editor && <Toolbar editor={editor} />}

<div className="document-container overflow-y-auto" >
  <Stack 
    direction="column" 
    // spacing={2} // Adds spacing between elements
    sx={{
      // backgroundColor: "blue", // Debugging visibility
      mt: -10,
      maxHeight: "100%", // Ensures it respects the container's height
      overflowY: "auto", // Enables scrolling
      overflowX: "hidden",
      // boxShadow: 10,
      // borderRadius: 3,
      scrollBehavior: "smooth",
      // padding: "16px",
    }}
  >
    <div 
      ref={editorRef} 
      // className="page-break w-full bg-red-400 shadow-lg rounded-lg flex flex-col" 
      style={{ height: paperSizes[paperSize].height }}
    >
      <EditorContent 
        editor={editor} 
        className="rounded-lg shadow-lg"
      />
    </div>
  </Stack>
</div>


    </div>
    );
};