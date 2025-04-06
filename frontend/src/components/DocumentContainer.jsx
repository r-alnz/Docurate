"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Editor } from "@tinymce/tinymce-react"
import { getToken } from "../utils/authUtil"
import { createDocument, updateDocument, getDocumentById, getDocumentsByUser } from "../services/documentService"
import { getTemplateById } from "../services/templateService"
import imageCompression from "browser-image-compression"
import { X, Printer, Save } from "lucide-react"

// Function to find user ID from various storage locations
const findUserId = () => {
  // Try to find user info in common storage patterns
  try {
    // Option 1: Check localStorage with common keys
    const storageKeys = ["userInfo", "user", "currentUser", "auth", "userData", "profile"]

    for (const key of storageKeys) {
      const data = localStorage.getItem(key)
      if (data) {
        const parsed = JSON.parse(data)
        if (parsed._id) return parsed._id
        if (parsed.id) return parsed.id
        if (parsed.userId) return parsed.userId
        if (parsed.user && parsed.user._id) return parsed.user._id
        if (parsed.user && parsed.user.id) return parsed.user.id
      }
    }

    // Option 2: Check sessionStorage with the same keys
    for (const key of storageKeys) {
      const data = sessionStorage.getItem(key)
      if (data) {
        const parsed = JSON.parse(data)
        if (parsed._id) return parsed._id
        if (parsed.id) return parsed.id
        if (parsed.userId) return parsed.userId
        if (parsed.user && parsed.user._id) return parsed.user._id
        if (parsed.user && parsed.user.id) return parsed.user.id
      }
    }

    // Option 3: Try to parse the token itself if it's a JWT
    const token = getToken()
    if (token && token.split(".").length === 3) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]))
        if (payload.id) return payload.id
        if (payload._id) return payload._id
        if (payload.sub) return payload.sub
      } catch (e) {
        console.error("Error parsing JWT token:", e)
      }
    }

    // If we get here, we couldn't find a user ID
    return null
  } catch (error) {
    console.error("Error finding user ID:", error)
    return null
  }
}

const DocumentContainer = () => {
  const { id, templateId } = useParams() // `id` for the document and `templateId` for creating based on a template
  const [pages, setPages] = useState([{ id: 1, content: "" }])
  const [currentPage, setCurrentPage] = useState(1)
  const [title, setTitle] = useState("")
  const [template, setTemplate] = useState(null)
  const [paperSize, setPaperSize] = useState("letter")
  const [isUpdateMode, setIsUpdateMode] = useState(false)
  const navigate = useNavigate()
  const [isDataLoaded, setIsDataLoaded] = useState(false)
  const [message, setMessage] = useState(null)
  // Inside your DocumentContainer component, add this state
  const [existingTitles, setExistingTitles] = useState([])
  const [titleError, setTitleError] = useState(null)

  const DPI = 96 // Fixed DPI for page dimensions
  const pageSizes = {
    letter: { width: DPI * 8.5, height: DPI * 11 },
    legal: { width: DPI * 8.5, height: DPI * 14 },
    a4: { width: DPI * 8.27, height: DPI * 11.69 },
  }

  const selectedPageSize = pageSizes[paperSize]

  const [margins, setMargins] = useState({
    top: 1,
    bottom: 1,
    left: 1,
    right: 1,
  })

  // Add this useEffect to load existing document titles
  useEffect(() => {
    const loadExistingTitles = async () => {
      try {
        const token = getToken()

        // Find the user ID using our helper function
        const userId = findUserId()

        if (!userId) {
          console.error("User ID not found")
          // Instead of returning, let's continue without filtering by existing titles
          setExistingTitles([])
          return
        }

        const documents = await getDocumentsByUser(userId, token, "active")

        // Filter out the current document's title if in update mode
        const titles = documents.filter((doc) => !isUpdateMode || doc._id !== id).map((doc) => doc.title.toLowerCase())
        setExistingTitles(titles)
      } catch (err) {
        console.error("Error loading document titles:", err)
        // Set empty array to avoid undefined errors
        setExistingTitles([])
      }
    }

    // Only load titles after user authentication is confirmed
    if (getToken()) {
      loadExistingTitles()
    }
  }, [id, isUpdateMode])

  // Add this validation function
  const validateTitle = (title) => {
    if (!title) {
      setTitleError("Title is required")
      return false
    }

    if (existingTitles.includes(title.toLowerCase())) {
      setTitleError("A document with this title already exists. Please choose a different title.")
      return false
    }

    setTitleError(null)
    return true
  }

  const sharedStyles = `
    @font-face {
            font-family: 'Century Gothic';
            src: local('Century Gothic'), /* Uses installed font on the system */
                url('/fonts/CenturyGothic.woff2') format('woff2'),
                url('/fonts/CenturyGothic.woff') format('woff'),
                url('/fonts/CenturyGothic.ttf') format('truetype');
            font-weight: normal;
            font-style: normal;
    }

    @font-face {
        font-family: 'Palatino Linotype';
        src: local('Palatino Linotype'), /* Uses installed font on the system */
            url('/fonts/PalatinoLinotype.woff2') format('woff2'),
            url('/fonts/PalatinoLinotype.woff') format('woff'),
            url('/fonts/PalatinoLinotype.ttf') format('truetype');
        font-weight: normal;
        font-style: normal;
    }
            
    body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
    }

    .non-editable {
        /* Styles for non-editable elements */
    }

    .editable {
        background-color: #fffbe6;
        border: 1px dashed #ffa000;
        padding: 2px;
    }

    .editable:hover {
        border-color: #ff6f00;
        background-color: #fff3e0;
    }

    /* Header and Footer styles */
    .header {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: auto;
        padding: 5px;
        z-index: 100;
    }

    .footer {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: auto;
        padding: 5px;
        z-index: 100;
    }

    .header img, .footer img {
        max-width: 100%;
        height: auto;
        display: block;
    }

    .page, .mce-content-body {
        position: relative;
        width: ${selectedPageSize.width / DPI}in;
        min-height: ${selectedPageSize.height / DPI + 1}in;
        max-height: ${selectedPageSize.height / DPI + 1}in;
        padding: ${margins.top}in ${margins.right}in ${margins.bottom}in ${margins.left}in;
        box-sizing: border-box;
        margin: 2.6rem auto;
        background-color: white;
        border: 1px solid #ddd;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        font-size: 12pt;
        line-height: 1.15;
    }

    .draggable-image {
        padding: 4px;
        background-color: rgba(255, 255, 255, 0.8);
        display: inline-block;
        position: absolute; /* To support dragging */
        cursor: move; /* Indicates draggable */
        resize: both; /* Enable resizing */
        overflow: hidden; /* Prevent content overflow during resizing */
    }

    .draggable-image img {
        width: 100%; /* Ensure image scales with container */
        height: 100%; /* Maintain aspect ratio */
        display: block;
    }

    .mce-content-body p {
        margin: 0;
        margin-bottom: 8pt;
    }
    `

  const printStyles = `
       @font-face {
            font-family: 'Century Gothic';
            src: local('Century Gothic'), /* Uses installed font on the system */
                url('/fonts/CenturyGothic.woff2') format('woff2'),
                url('/fonts/CenturyGothic.woff') format('woff'),
                url('/fonts/CenturyGothic.ttf') format('truetype');
            font-weight: normal;
            font-style: normal;
        }

        @font-face {
            font-family: 'Palatino Linotype';
            src: local('Palatino Linotype'), /* Uses installed font on the system */
                url('/fonts/PalatinoLinotype.woff2') format('woff2'),
                url('/fonts/PalatinoLinotype.woff') format('woff'),
                url('/fonts/PalatinoLinotype.ttf') format('truetype');
            font-weight: normal;
            font-style: normal;
        }
        
        /* Header and Footer styles for printing */
        .header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: auto;
            padding: 5px;
        }

        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: auto;
            padding: 5px;
        }

        .header img, .footer img {
            max-width: 100%;
            height: auto;
            display: block;
        }
        
        .draggable-image {
           
            padding: 4px;
            background-color: rgba(255, 255, 255, 0.8);
            display: inline-block;
            position: absolute; /* To support dragging */
            cursor: move; /* Indicates draggable */
            resize: both; /* Enable free resizing */
            overflow: hidden; /* Prevent content overflow during resizing */
        }

        .draggable-image img {
            width: 100%; /* Ensure image scales with container */
            height: auto; /* Maintain aspect ratio */
            display: block;
        }
            
        @page {
            size: ${selectedPageSize.width / DPI}in ${selectedPageSize.height / DPI}in;
        }

        body {
            margin: 0;
            padding: 0;
        }

        .page, .mce-content-body {
            position: relative;
            width: ${selectedPageSize.width / DPI}in;
            height: ${selectedPageSize.height / DPI}in;
            padding: ${margins.top}in ${margins.right}in ${margins.bottom}in ${margins.left}in;
            box-sizing: border-box;
            background-color: white;
            overflow: hidden;
            page-break-after: always;
        }

        p {
            margin: 0;
            margin-bottom: 8pt;
        }
    `

  useEffect(() => {
    const loadDocumentOrTemplate = async () => {
      try {
        const token = getToken()
        if (id) {
          const documentData = await getDocumentById(id, token)

          if (documentData?.template?.margins) {
            const { top, bottom, left, right } = documentData.template.margins
            setMargins({
              top: typeof top === "number" ? top : 1,
              bottom: typeof bottom === "number" ? bottom : 1,
              left: typeof left === "number" ? left : 1,
              right: typeof right === "number" ? right : 1,
            })
          }

          setTitle(documentData.title)
          setTemplate(documentData.template)
          setPaperSize(documentData.template?.paperSize)

          setPages(
            documentData.content.split('<hr style="page-break-after: always;">').map((content, index) => ({
              id: index + 1,
              content,
            })),
          )

          setIsUpdateMode(true)
        } else if (templateId) {
          const templateData = await getTemplateById(templateId, token)

          console.log(templateData)
          if (templateData?.margins) {
            // Check if margins exist
            console.log(1)
            const { top, bottom, left, right } = templateData.margins
            setMargins({
              top: top,
              bottom: bottom,
              left: left,
              right: right,
            })
          }

          setTemplate(templateData)
          setPaperSize(templateData.paperSize) // Lock paper size for updates
          setPages(
            templateData.content.split('<hr style="page-break-after: always;">').map((content, index) => ({
              id: index + 1,
              content,
            })),
          )
        }
        setIsDataLoaded(true) // Mark data as loaded
      } catch (error) {
        console.error("Error loading data:", error.message)
        showMessage("Failed to load data. Please try again.")
      }
    }

    loadDocumentOrTemplate()
  }, [id, templateId])

  const compressImage = async (file) => {
    const options = {
      maxSizeMB: 0.5, // Reduced max file size in MB for higher compression
      maxWidthOrHeight: 1280, // Smaller dimensions for greater compression
      useWebWorker: true, // Use Web Workers for faster processing
    }
    try {
      return await imageCompression(file, options)
    } catch (error) {
      console.error("Image compression error:", error)
      throw new Error("Failed to compress image")
    }
  }

  const addImageToEditor = (editor, file) => {
    const reader = new FileReader()
    reader.onload = () => {
      editor.insertContent(`<img src="${reader.result}" alt="Compressed Image" />`)
    }
    reader.readAsDataURL(file)
  }

  const handleImageUpload = (editor) => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = async () => {
      const file = input.files[0]
      if (file) {
        try {
          const compressedFile = await compressImage(file)
          addImageToEditor(editor, compressedFile)
        } catch (error) {
          console.error("Error compressing image:", error.message)
          showMessage("Failed to compress and insert image. Please try again.")
        }
      }
    }
    input.click()
  }

  // Add function to handle header/footer image upload - Copied exactly from template container
  const insertHeaderFooterImage = (editor, position, file) => {
    const reader = new FileReader()
    reader.onload = () => {
      // Create a unique ID for the header/footer element
      const uniqueId = `${position}-${Date.now()}`

      // Position the footer at the bottom of the page
      const positionStyle =
        position === "header"
          ? "position: absolute; top: 0; left: 0; right: 0; z-index: 100;"
          : "position: absolute; bottom: 0; left: 0; right: 0; z-index: 100;"

      const imageHtml = `
        <div id="${uniqueId}" class="${position}" style="${positionStyle}">
          <img src="${reader.result}" alt="${position} image" style="max-width: 100%; height: auto; display: block;" />
        </div>
      `

      // For header, insert at the beginning; for footer, we need to ensure it's at the end
      if (position === "header") {
        // Insert at the beginning of the editor content
        const currentContent = editor.getContent()
        editor.setContent(imageHtml + currentContent)

        // After the image loads, measure its height and add a small spacer
        const img = new Image()
        img.src = reader.result
        img.onload = () => {
          // Get the header element
          const headerElement = editor.getBody().querySelector(`#${uniqueId}`)
          if (headerElement) {
            // Create a paragraph with minimal spacing after the header
            const spacerParagraph = editor.dom.create(
              "p",
              {
                style: "margin-top: 5px;", // Minimal spacing
              },
              "&nbsp;",
            )

            // Insert the spacer at the beginning of the content
            editor.getBody().insertBefore(spacerParagraph, headerElement.nextSibling)

            // Move cursor to after the spacer
            const range = editor.dom.createRng()
            range.setStart(spacerParagraph, 0)
            range.setEnd(spacerParagraph, 0)
            editor.selection.setRng(range)
          }
        }
      } else {
        // For footer, we need to append it to the end of the content
        editor.insertContent(imageHtml)

        // Make sure the footer stays at the bottom by moving it to the end of the content
        const editorBody = editor.getBody()
        const footerElement = editorBody.querySelector(`#${uniqueId}`)
        if (footerElement) {
          editorBody.appendChild(footerElement)
        }
      }

      // Make sure the editor knows content has changed
      editor.undoManager.add()
      editor.fire("change")
    }
    reader.readAsDataURL(file)
  }

  const handleHeaderFooterUpload = (editor, position) => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = async () => {
      const file = input.files[0]
      if (file) {
        try {
          const compressedFile = await compressImage(file)
          insertHeaderFooterImage(editor, position, compressedFile)
        } catch (error) {
          console.error(`Error compressing ${position} image:`, error.message)
          showMessage(`Failed to add ${position} image. Please try again.`)
        }
      }
    }
    input.click()
  }

  // Add function to handle draggable images - Copied exactly from template container
  const addDraggableImage = (editor, file) => {
    const reader = new FileReader()
    reader.onload = () => {
      const uniqueId = `draggable-${Date.now()}`
      const imageHtml = `
        <img
          id="${uniqueId}"
          src="${reader.result}"
          alt="Draggable Image"
          class="draggable-image"
          style="position: absolute; top: 50px; left: 50px; display: block; cursor: move; z-index: 1000;"
        />
      `
      editor.insertContent(imageHtml)
    }
    reader.readAsDataURL(file)
  }

  const handleEditorChange = (content, pageId) => {
    setPages((prevPages) => prevPages.map((page) => (page.id === pageId ? { ...page, content } : page)))
  }

  const handleAddPage = () => {
    setPages((prevPages) => [...prevPages, { id: prevPages.length + 1, content: "" }])
    setCurrentPage(pages.length + 1)
  }

  const handleDeletePage = () => {
    if (pages.length > 1) {
      const confirmed = window.confirm("Are you sure you want to delete this page?")
      if (confirmed) {
        const newPages = pages.filter((page) => page.id !== currentPage)
        setPages(newPages)
        setCurrentPage((prev) => (prev > newPages.length ? newPages.length : prev))
      }
    } else {
      showMessage("You cannot delete the last page!")
    }
  }

  const handleNextPage = () => {
    if (currentPage < pages.length) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const showMessage = (text, type = "success") => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 3000) // Auto-hide after 3 seconds
  }

  // Modify the handleSaveOrUpdateDocument function
  const handleSaveOrUpdateDocument = async () => {
    if (!validateTitle(title) || pages.length === 0) {
      showMessage(titleError || "⚠️ Please fill in all required fields and ensure there is content.", "warning")
      return
    }

    const combinedContent = pages.map((page) => page.content).join('<hr style="page-break-after: always;">')

    const documentData = {
      title,
      template: template?._id,
      content: combinedContent,
      margins,
    }

    try {
      const token = getToken()
      if (isUpdateMode) {
        await updateDocument(id, documentData, token)
        showMessage("✅ Document updated successfully!", "success")
      } else {
        await createDocument(documentData, token)
        showMessage("✅ Document created successfully!", "success")
        navigate("/documents")
      }
    } catch (error) {
      if (error.message.includes("title already exists")) {
        setTitleError("A document with this title already exists. Please choose a different title.")
        showMessage("❌ " + error.message, "error")
      } else {
        console.error("Error saving/updating document:", error.message)
        showMessage("❌ Failed to save/update document. Please try again.", "error")
      }
    }
  }

  const handlePrintDocument = () => {
    const iframe = document.createElement("iframe")
    document.body.appendChild(iframe)
    const iframeDoc = iframe.contentWindow.document

    // Combine content of all pages
    const combinedContent = pages
      .map(
        (page) => `
          <div class="page">
            ${page.content.trim() || "<p>&nbsp;</p>"}
          </div>
        `,
      )
      .join("")

    iframeDoc.open()
    iframeDoc.write(`
      <html>
        <head>
          <title>Print Document</title>
          <style>
            ${printStyles} /* Ensure normal print styles */
            body {
              font-family: Arial; /* Dynamically set font family */                            
            }
            .no-print {
              display: none !important; /* Hide margin overlay */
            }
          </style>
        </head>
        <body>
          ${combinedContent}
        </body>
      </html>
    `)
    iframeDoc.close()

    const iframeWindow = iframe.contentWindow

    // Ensure images load before printing
    const images = iframeDoc.getElementsByTagName("img")
    const promises = Array.from(images).map((img) => {
      return new Promise((resolve) => {
        if (img.complete) {
          resolve()
        } else {
          img.onload = resolve
          img.onerror = resolve
        }
      })
    })

    Promise.all(promises).then(() => {
      iframeWindow.focus()
      iframeWindow.print()
      document.body.removeChild(iframe) // Cleanup the iframe
    })
  }

  return (
    <div className="p-4">
      <div className="flex justify-end">
        <div
          onClick={() => navigate("/documents")}
          className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 cursor-pointer"
        >
          <X className="text-white" />
        </div>
      </div>
      <h1 className="text-2xl font-bold mb-4">{isUpdateMode ? "Edit Document" : "Create New Document"}</h1>
      <div className="mb-4 border p-4 rounded shadow">
        <h2 className="text-xl font-medium mb-4">Document Information</h2>
        <label className="block text-gray-700 font-medium mb-2">Title:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            if (e.target.value) validateTitle(e.target.value)
          }}
          placeholder="Enter document title"
          className={`w-full border rounded p-2 ${titleError ? "border-red-500" : ""}`}
        />
        {titleError && <p className="text-red-500 text-sm mt-1">{titleError}</p>}
        {template && (
          <p className="text-gray-700 mb-4">
            <strong>Template:</strong> {template.name}
          </p>
        )}
      </div>

      <div className="mb-4">
        <div className="flex justify-between mb-4">
          <button
            disabled={currentPage === 1}
            onClick={handlePreviousPage}
            className="bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {pages.length}
          </span>
          <button
            disabled={currentPage === pages.length}
            onClick={handleNextPage}
            className="bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
          >
            Next
          </button>
        </div>

        {/* Add/Delete Buttons */}
        <div className="mb-4 flex justify-end gap-4">
          <button onClick={handleAddPage} className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700">
            Add Page
          </button>
          <button onClick={handleDeletePage} className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-700">
            Delete Page
          </button>
        </div>

        {isDataLoaded ? (
          pages.map((page) => (
            <div key={page.id} style={{ display: currentPage === page.id ? "block" : "none" }}>
              <Editor
                apiKey="iao6fh65t97ayqmiahlxmxlj0bh94ynxw83kfyh0vbqaig9y"
                value={page.content}
                init={{
                  height: selectedPageSize.height,
                  menubar: true,
                  plugins: [
                    "advlist",
                    "autolink",
                    "lists",
                    "link",
                    "image",
                    "lists",
                    "pagebreak",
                    "searchreplace",
                    "wordcount",
                    "code",
                    "fullscreen",
                    "insertdatetime",
                    "media",
                    "table",
                    "code",
                    "help",
                    "wordcount",
                  ],
                  toolbar:
                    "undo redo | formatselect | bold italic backcolor | " +
                    "alignleft aligncenter alignright alignjustify | " +
                    "bullist numlist outdent indent | addDraggableImage | addHeaderImage addFooterImage | addHangingIndent removeHangingIndent | help",
                  content_style: sharedStyles,
                  browser_spellcheck: true,
                  contextmenu: false, // Disable TinyMCE's default context menu to allow browser's spell check menu
                  setup: (editor) => {
                    editor.on("drop", (event) => {
                      event.preventDefault() // Prevent TinyMCE's default drop handling
                      event.stopPropagation() // Stop propagation of the event to prevent other handlers
                    })

                    editor.on("init", () => {
                      const iframeDoc = editor.getDoc() // Access TinyMCE's iframe document
                      const editorBody = editor.getBody()

                      // Setup draggable image functionality - Copied exactly from template container
                      iframeDoc.addEventListener("mousedown", (e) => {
                        const target = e.target.closest(".draggable-image")
                        if (!target) return

                        const offsetX = e.clientX - target.offsetLeft
                        const offsetY = e.clientY - target.offsetTop

                        const onMouseMove = (event) => {
                          target.style.left = `${event.clientX - offsetX}px`
                          target.style.top = `${event.clientY - offsetY}px`
                        }

                        const onMouseUp = () => {
                          iframeDoc.removeEventListener("mousemove", onMouseMove)
                          iframeDoc.removeEventListener("mouseup", onMouseUp)

                          // Update TinyMCE's content
                          const uniqueId = target.getAttribute("id")
                          if (uniqueId) {
                            const tinyTarget = editor.dom.get(uniqueId)
                            editor.dom.setStyles(tinyTarget, {
                              left: target.style.left,
                              top: target.style.top,
                            })

                            // Synchronize TinyMCE content
                            const updatedContent = editor.getContent()
                            editor.setContent(updatedContent)

                            // Trigger TinyMCE's change event to ensure synchronization
                            editor.undoManager.add()
                            editor.fire("change")
                            console.log(editor.getContent()) // Verify updated content
                          } else {
                            console.warn("Draggable image has no ID. Ensure unique IDs are assigned.")
                          }
                        }

                        iframeDoc.addEventListener("mousemove", onMouseMove)
                        iframeDoc.addEventListener("mouseup", onMouseUp)
                      })
                    })

                    // Add Draggable Image Button - Copied exactly from template container
                    editor.ui.registry.addButton("addDraggableImage", {
                      text: "Insert Image",
                      icon: "image",
                      onAction: () => {
                        const input = document.createElement("input")
                        input.type = "file"
                        input.accept = "image/*"
                        input.onchange = async () => {
                          const file = input.files[0]
                          if (file) {
                            try {
                              addDraggableImage(editor, file)
                            } catch (error) {
                              console.error("Error adding draggable image:", error.message)
                              showMessage("Failed to add image. Please try again.")
                            }
                          }
                        }
                        input.click()
                      },
                    })

                    // Add Header Image Button - Copied exactly from template container
                    editor.ui.registry.addButton("addHeaderImage", {
                      text: "Add Header",
                      icon: "image",
                      tooltip: "Add Header Image",
                      onAction: () => handleHeaderFooterUpload(editor, "header"),
                    })

                    // Add Footer Image Button - Copied exactly from template container
                    editor.ui.registry.addButton("addFooterImage", {
                      text: "Add Footer",
                      icon: "image",
                      tooltip: "Add Footer Image",
                      onAction: () => handleHeaderFooterUpload(editor, "footer"),
                    })

                    editor.on("keydown", (event) => {
                      if (event.key === "Tab") {
                        event.preventDefault() // Prevent default tab behavior
                        const selection = editor.selection
                        const content = selection.getContent({
                          format: "html",
                        })

                        // Insert a "tab" as multiple non-breaking spaces
                        const tabEquivalent = "&nbsp;&nbsp;&nbsp;&nbsp;" // 4 spaces (adjust as needed)
                        const newContent = `${tabEquivalent}${content}`
                        selection.setContent(newContent)
                      }
                    })

                    // Prevent interaction outside of editable spans within non-editable blocks
                    editor.on("BeforeExecCommand", (e) => {
                      const selectedNode = editor.selection.getNode()
                      if (selectedNode.closest(".non-editable") && !selectedNode.classList.contains("editable")) {
                        e.preventDefault() // Block commands like typing or formatting
                      }
                    })

                    // Prevent cursor placement or interaction outside of editable spans
                    editor.on("MouseDown", (e) => {
                      const targetNode = e.target
                      if (targetNode.closest(".non-editable") && !targetNode.classList.contains("editable")) {
                        e.preventDefault() // Prevent clicking into non-editable areas
                        editor.selection.collapse() // Remove selection
                      }
                    })

                    // Ensure `editable` spans remain editable
                    editor.on("BeforeSetContent", (e) => {
                      const parser = new DOMParser()
                      const doc = parser.parseFromString(e.content, "text/html")
                      const nonEditableElements = doc.querySelectorAll(".non-editable")
                      nonEditableElements.forEach((el) => {
                        // Set non-editable container to not allow interaction
                        el.setAttribute("contenteditable", "false")

                        // Ensure editable spans inside remain editable
                        el.querySelectorAll(".editable").forEach((span) => {
                          span.setAttribute("contenteditable", "true")
                        })
                      })
                      e.content = doc.body.innerHTML
                    })

                    // Prevent deletion of editable spans when they become empty
                    editor.on("KeyDown", (e) => {
                      if (e.keyCode === 8 || e.keyCode === 46) {
                        // Backspace or Delete key
                        const selectedNode = editor.selection.getNode()
                        const editableSpan = selectedNode.closest(".editable")

                        if (editableSpan) {
                          const content = editableSpan.textContent.trim()
                          if (content === "" || content.length === 1) {
                            // If content is empty or has only one character left
                            e.preventDefault() // Prevent the deletion
                            // Optionally, you can set a minimum content to ensure visibility
                            if (content === "") {
                              editableSpan.innerHTML = "&nbsp;"
                              // Place cursor at the beginning of the span
                              const range = editor.dom.createRng()
                              range.setStart(editableSpan, 0)
                              range.setEnd(editableSpan, 0)
                              editor.selection.setRng(range)
                            }
                          }
                        }
                      }
                    })

                    // Add Hanging Indent Button
                    editor.ui.registry.addButton("addHangingIndent", {
                      text: "Hanging Indent",
                      icon: "indent",
                      tooltip: "Add Hanging Indent",
                      onAction: () => {
                        const selectedNode = editor.selection.getNode() // Get the selected node
                        const isParagraph = selectedNode.nodeName === "P" // Check if it's a <p> element

                        if (isParagraph) {
                          // Update the style directly for <p> elements
                          selectedNode.style.textIndent = "-40px"
                          selectedNode.style.marginLeft = "40px"
                        } else {
                          // Wrap in a <p> if not already a block element
                          const content = editor.selection.getContent({
                            format: "html",
                          })
                          editor.selection.setContent(
                            `<p style="text-indent: -40px; margin-left: 40px;">${content}</p>`,
                          )
                        }
                      },
                    })

                    // Remove Hanging Indent Button
                    editor.ui.registry.addButton("removeHangingIndent", {
                      text: "Remove Hanging Indent",
                      icon: "outdent",
                      tooltip: "Remove Hanging Indent",
                      onAction: () => {
                        const selectedNode = editor.selection.getNode() // Get the selected node
                        const isParagraph = selectedNode.nodeName === "P" // Check if it's a <p> element

                        if (isParagraph) {
                          // Remove the hanging indent styles
                          selectedNode.style.textIndent = ""
                          selectedNode.style.marginLeft = ""
                        } else {
                          // Handle nested <p> tags (if any)
                          const content = editor.selection.getContent({
                            format: "html",
                          })
                          editor.selection.setContent(
                            content.replace(
                              /<p[^>]*style=["'][^"']*text-indent:\s*-40px;?\s*margin-left:\s*40px;?[^"']*["'][^>]*>(.*?)<\/p>/g,
                              "$1",
                            ),
                          )
                        }
                      },
                    })
                  },
                }}
                onEditorChange={(content) => handleEditorChange(content, page.id)}
              />
            </div>
          ))
        ) : (
          <p>Loading editor...</p>
        )}
      </div>

      <div className="mt-4 flex gap-4">
        <button
          onClick={handleSaveOrUpdateDocument}
          className="bg-[#4CAF50] text-white py-2 px-4 rounded hover:bg-[#45a049] flex items-center gap-2 transform hover:scale-105 transition-all duration-200"
        >
          <Save className="text-white" /> {/* Add the save icon */}
          {isUpdateMode ? "Update Document" : "Save Document"}
        </button>

        {/* Mini Message Box (Centered) */}
        {message && (
          <div
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                    p-4 rounded shadow-lg text-white text-center w-80"
            style={{
              backgroundColor:
                message.type === "success" ? "#4CAF50" : message.type === "error" ? "#F44336" : "#FFC107",
            }}
          >
            {message.text}
          </div>
        )}

        <button
          onClick={handlePrintDocument}
          className="bg-[#38b6ff] text-white py-2 px-4 rounded hover:bg-[#1a8cd8] flex items-center gap-2 hover:scale-105"
        >
          <Printer className="text-white" />
          Print Document
        </button>
      </div>
    </div>
  )
}

export default DocumentContainer

