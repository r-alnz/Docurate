"use client"

import { useState, useEffect } from "react"
import { useAuthContext } from "../hooks/useAuthContext"
import { useParams, useNavigate } from "react-router-dom"
import { Editor } from "@tinymce/tinymce-react"
import { getToken } from "../utils/authUtil.js"
import { createTemplate, getTemplateById, updateTemplate, fetchDecisionTree } from "../services/templateService.js"
import imageCompression from "browser-image-compression"
import { X, Printer, Save, CheckCircle, XCircle, Loader } from "lucide-react"

const TemplateContainer = ({ suborgs }) => {
  console.log("suborgs:", suborgs)

  const { user } = useAuthContext()
  const { id } = useParams() // Fetch ID from the URL if available
  const [pages, setPages] = useState([{ id: 1, content: "" }])
  const [currentPage, setCurrentPage] = useState(1)

  const [requiredRole, setRequiredRole] = useState("student")
  const [suborganizations, setSuborganizations] = useState([])
  const [selectedSubOrg, setSelectedSubOrg] = useState("")
  const [paperSize, setPaperSize] = useState("letter")
  const [strictMode, setStrictMode] = useState(false) // Strict mode toggle
  const [editorLoaded, setEditorLoaded] = useState(false)
  const [isUpdateMode, setIsUpdateMode] = useState(false)

  const [documentName, setDocumentName] = useState("")
  const [decisionTree, setDecisionTree] = useState({})
  const [documentType, setDocumentType] = useState("")
  const [documentSubtype, setDocumentSubtype] = useState("")
  const [customType, setCustomType] = useState("")
  const [customSubtype, setCustomSubtype] = useState("")
  const [isCustomType, setIsCustomType] = useState(false)
  const [subtypeOptions, setSubtypeOptions] = useState([])

  const [templateSuggestions, setTemplateSuggestions] = useState([])
  const [filteredSuggestions, setFilteredSuggestions] = useState([])
  const [message, setMessage] = useState(null)
  const [autoSaveStatus, setAutoSaveStatus] = useState(null)
  const [autoSaveTimer, setAutoSaveTimer] = useState(null)
  const [templateId, setTemplateId] = useState(id || null)
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false)

  const showMessage = (text, type = "info") => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 3000) // Auto-hide after 3 seconds
  }

  const navigate = useNavigate()

  const DPI = 96 // Fixed DPI for page dimensions
  const pageSizes = {
    letter: { width: DPI * 8.5, height: DPI * 11 },
    legal: { width: DPI * 8.5, height: DPI * 14 },
    a4: { width: DPI * 8.27, height: DPI * 11.69 },
  }

  const [margins, setMargins] = useState({
    top: 1, // Default: 1 inch
    bottom: 1,
    left: 1,
    right: 1,
  })

  // add this border if need on draggable image
  // border: 1px dashed #ccc;

  const selectedPageSize = pageSizes[paperSize]

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

    .page, .mce-content-body {
        position: relative;
        width: ${selectedPageSize.width / DPI}in;
        min-height: ${selectedPageSize.height / DPI}in;
        max-height: ${selectedPageSize.height / DPI}in;
        padding: ${DPI * margins.top}px ${DPI * margins.right}px ${DPI * margins.bottom}px ${DPI * margins.left}px;
        box-sizing: border-box;
        margin: 2.6rem auto;
        background-color: white;
        border: 1px solid #ddd;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        font-size: 12pt;
        line-height: 1.15;
    }

    .mce-content-body p {
        margin: 0;
        margin-bottom: 8pt;
         overflow-wrap: break-word;
    }

    .mce-content-body .page-break {
    display: block;
    page-break-before: always;
}

    /* Custom spell checker styles */
    .mce-spellchecker-word {
        background-color: #4a86e8 !important;
        color: white !important;
        padding: 2px !important;
        border-radius: 2px !important;
        cursor: pointer !important;
    }

    .spell-suggestions-popup {
        position: absolute;
        background: white;
        border: 1px solid #ccc;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        padding: 5px 0;
        z-index: 1000;
        min-width: 150px;
    }

    .spell-suggestion-item {
        padding: 5px 15px;
        cursor: pointer;
    }

    .spell-suggestion-item:hover {
        background-color: #f0f0f0;
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
    const loadDecisionTree = async () => {
      try {
        const token = getToken()
        const tree = await fetchDecisionTree(token)
        setDecisionTree(tree)
      } catch (error) {
        console.error("Error fetching decision tree:", error.message)
        // alert("Failed to fetch decision tree. Please try again.")
      }
    }

    loadDecisionTree()
  }, [])

  useEffect(() => {
    // Populate suggestions based on the decision tree
    if (decisionTree) {
      const names = []
      Object.keys(decisionTree).forEach((type) => {
        if (decisionTree[type]?.subtype) {
          Object.keys(decisionTree[type].subtype).forEach((subtype) => {
            decisionTree[type].subtype[subtype].forEach((template) => {
              names.push(template.name)
            })
          })
        }
      })
      setTemplateSuggestions(names)
    }
  }, [decisionTree])

  const handleTemplateNameChange = (e) => {
    const input = e.target.value
    setDocumentName(input)

    // Filter suggestions
    const filtered = templateSuggestions.filter((name) => name.toLowerCase().includes(input.toLowerCase()))
    setFilteredSuggestions(filtered)
  }

  // const handleTypeChange = (e) => {
  //     const selectedType = e.target.value;
  //     setDocumentType(selectedType);
  //     setDocumentSubtype(''); // Reset subtype when type changes

  //     if (selectedType === 'custom') {
  //         setIsCustomType(true);
  //     } else {
  //         setIsCustomType(false);
  //         setSubtypeOptions(Object.keys(decisionTree[selectedType]?.subtype || {}));
  //     }
  // };

  // const handleSubtypeChange = (e) => {
  //     setDocumentSubtype(e.target.value);
  // };

  useEffect(() => {
    if (!id) return // Only run if we have an ID

    // Only load if decisionTree is ready (i.e. not empty)
    if (!decisionTree || Object.keys(decisionTree).length === 0) return

    const loadTemplate = async () => {
      try {
        const token = getToken()
        const templateData = await getTemplateById(id, token)

        // Check if fetched type exists in our decisionTree
        if (decisionTree[templateData.type]) {
          // Known type => not custom
          setIsCustomType(false)
          setDocumentType(templateData.type)
          setDocumentSubtype(templateData.subtype || "")

          // Here we populate the subtypes array for the user to select from
          const subtypes = Object.keys(decisionTree[templateData.type].subtype || {})
          setSubtypeOptions(subtypes)
        } else {
          setIsCustomType(true)
          setCustomType(templateData.type)
          setCustomSubtype(templateData.subtype || "")

          // Make the main dropdown show "custom"
          setDocumentType("custom")

          // Prevent collision with normal subtype
          setDocumentSubtype("")
        }

        setDocumentName(templateData.name)
        setRequiredRole(templateData.requiredRole)
        setPaperSize(templateData.paperSize)
        setSelectedSubOrg(templateData.suborganizations)
        console.log("heyyy", templateData.suborganizations)

        // Split pages on the page-break <hr>
        setPages(
          templateData.content.split('<hr style="page-break-after: always;">').map((content, index) => ({
            id: index + 1,
            content,
          })),
        )

        if (templateData.margins) {
          setMargins(templateData.margins)
        }

        // Check if "non-editable" class is in the content
        const hasNonEditable = templateData.content.includes('class="non-editable"')
        setStrictMode(hasNonEditable)

        setIsUpdateMode(true)
        setEditorLoaded(true)
        setAutoSaveEnabled(true) // Enable auto-save for existing templates
      } catch (error) {
        console.error("Error loading template:", error.message)
        showMessage("Failed to load template. Please try again.", "error")
      }
    }

    loadTemplate()
  }, [id, decisionTree])

  const handleMarginChange = (e) => {
    const { name, value } = e.target
    setMargins((prevMargins) => ({
      ...prevMargins,
      [name]: Number.parseFloat(value),
    }))
  }

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
          showMessage("Failed to compress and insert image. Please try again.", "error")
        }
      }
    }
    input.click()
  }

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

      // Trigger auto-save after adding header/footer
      triggerAutoSave()
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
          showMessage(`Failed to add ${position} image. Please try again.`, "error")
        }
      }
    }
    input.click()
  }

  // Helper function to trigger auto-save
  const triggerAutoSave = () => {
    if (!autoSaveEnabled) return // Skip auto-save if not enabled

    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer)
    }
    setAutoSaveStatus("pending")
    const timer = setTimeout(() => {
      handleAutoSave()
    }, 8000)
    setAutoSaveTimer(timer)
  }

  const handleEditorChange = (content, editor, pageId) => {
    const updatedContent = strictMode
      ? content.includes('class="non-editable"')
        ? content // Avoid re-wrapping if already wrapped
        : `<div class="non-editable">${content}</div>`
      : content

    setPages((prevPages) => prevPages.map((page) => (page.id === pageId ? { ...page, content: updatedContent } : page)))

    // Clear any existing timer
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer)
    }

    // Set auto-save status to pending
    setAutoSaveStatus("pending")

    // Create a new timer for auto-save
    const timer = setTimeout(() => {
      handleAutoSave()
    }, 5000) // 5 seconds delay

    setAutoSaveTimer(timer)
  }

  const handleAutoSave = async () => {
    if (!autoSaveEnabled || !documentName || !documentType || !requiredRole || pages.length === 0) {
      setAutoSaveStatus("error")
      setTimeout(() => setAutoSaveStatus(null), 3000)
      return
    }

    const combinedContent = pages.map((page) => page.content).join('<hr style="page-break-after: always;">')

    const templateData = {
      name: documentName,
      content: combinedContent,
      type: isCustomType ? customType : documentType,
      subtype: isCustomType ? customSubtype : documentSubtype,
      requiredRole,
      paperSize,
      margins,
      suborganizations: selectedSubOrg.length === 0 ? [] : [selectedSubOrg],
    }

    try {
      const token = getToken()
      // Always use updateTemplate since auto-save is only enabled after manual save
      await updateTemplate(templateId || id, templateData, token)
      setAutoSaveStatus("success")
      setTimeout(() => setAutoSaveStatus(null), 3000)
    } catch (error) {
      console.error("Error auto-saving template:", error.message)
      setAutoSaveStatus("error")
      setTimeout(() => setAutoSaveStatus(null), 3000)
    }
  }

  useEffect(() => {
    // Clean up the timer when component unmounts
    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer)
      }
    }
  }, [autoSaveTimer])

  const preventOverflowTyping = (editor) => {
    editor.on("beforeInput", (event) => {
      const content = editor.getContent({ format: "text" }) // Get plain text
      const lines = content.split("\n").length // Count newlines

      const MAX_LINES = 2 // Set this based on your page height

      if (lines >= MAX_LINES || event.inputType === "insertParagraph") {
        event.preventDefault() // Stop more typing

        console.log("Page is full! Blocking further input.")
      }
    })
  }

  const toggleStrictMode = () => {
    setStrictMode((prevStrictMode) => {
      const newStrictMode = !prevStrictMode

      // Update the content of all pages based on strict mode
      setPages((prevPages) =>
        prevPages.map((page) => ({
          ...page,
          content: newStrictMode
            ? `<div class="non-editable">${page.content}</div>` // Add non-editable class
            : page.content.replace(/<div class="non-editable">(.*?)<\/div>/gs, "$1"), // Remove non-editable class
        })),
      )

      return newStrictMode
    })
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
      showMessage("You cannot delete the last page!", "error")
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

  const handleSaveOrUpdateTemplate = async () => {
    if (
      !documentName ||
      !documentType ||
      !requiredRole ||
      pages.length === 0 ||
      (isCustomType ? !customSubtype : !documentSubtype)
    ) {
      showMessage("Please fill in all required fields including subtype and ensure there is content.", "error")
      return
    }

    const combinedContent = pages.map((page) => page.content).join('<hr style="page-break-after: always;">')

    const templateData = {
      name: documentName,
      content: combinedContent,
      type: isCustomType ? customType : documentType,
      subtype: isCustomType ? customSubtype : documentSubtype,
      requiredRole,
      paperSize,
      margins,
      suborganizations: selectedSubOrg.length === 0 ? [] : [selectedSubOrg], // Allow empty
    }

    console.log("Submitting template:", templateData)

    try {
      const token = getToken()
      if (isUpdateMode) {
        await updateTemplate(id, templateData, token)
        showMessage("Template updated successfully!")
      } else {
        const response = await createTemplate(templateData, token)
        if (response && response._id) {
          setTemplateId(response._id)
          setIsUpdateMode(true) // Switch to update mode
        }
        showMessage("Template created successfully!")
        // Enable auto-save only after manual save is successful
        setAutoSaveEnabled(true)
        navigate("/templates") // Navigate back to templates page
      }
    } catch (error) {
      console.error("Error saving/updating template:", error.message)
      showMessage("Failed to save/update template. Please try again.", "error")
    }
  }

  const handlePrintDocument = () => {
    const iframe = document.createElement("iframe")
    document.body.appendChild(iframe)
    const iframeDoc = iframe.contentWindow.document

    // Get the font family from the editor dynamically
    //const editorContentBody = document.querySelector('.mce-content-body');
    // const editorFontFamily = window.getComputedStyle(editorContentBody).fontFamily;

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
                        ${printStyles}
                    </style>
                    <style>
                        body {
                            font-family: Arial; /* Dynamically set font family */
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

      // Trigger auto-save after adding image
      triggerAutoSave()
    }
    reader.readAsDataURL(file)
  }

  const enforcePagination = (editor) => {
    const pages = editor.getBody().querySelectorAll(".page")
    if (!pages.length) return

    const lastPage = pages[pages.length - 1]
    const pageHeight = lastPage.clientHeight // Max allowed height
    const contentHeight = lastPage.scrollHeight // Actual content height

    if (contentHeight > pageHeight) {
      // Move overflowing content to a new page
      moveOverflowToNewPage(editor, lastPage)
    }
  }

  const moveOverflowToNewPage = (editor, lastPage) => {
    const newPage = document.createElement("div")
    newPage.classList.add("page")
    newPage.innerHTML = "" // Empty for new content

    const paragraphs = [...lastPage.children]
    while (lastPage.scrollHeight > lastPage.clientHeight && paragraphs.length) {
      const movingElement = paragraphs.pop()
      newPage.insertBefore(movingElement, newPage.firstChild)
    }

    lastPage.parentNode.appendChild(newPage)
  }

  return (
    <div className="p-4">
      <div className="flex justify-end">
        <div
          onClick={() => navigate(-1)}
          className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 cursor-pointer"
        >
          <X className="text-white" />
        </div>
      </div>
      <h1 className="text-2xl font-bold mb-4">Template Editor</h1>
      <div className="mb-4 border p-4 rounded shadow">
        <h2 className="text-xl font-medium mb-4">Template Information</h2>
        <label className="block text-gray-700 font-medium mb-2">Template Name:</label>
        <div className="relative">
          <input
            type="text"
            value={documentName}
            onChange={handleTemplateNameChange}
            placeholder="Enter document name"
            className="w-full border rounded p-2 mb-4"
            required
            list="template-name-suggestions"
          />
          <datalist id="template-name-suggestions">
            {filteredSuggestions.map((name, index) => (
              <option key={index} value={name} />
            ))}
          </datalist>
        </div>
        <label className="block text-gray-700 font-medium mb-2">Document Type:</label>
        <select
          value={isCustomType ? "custom" : documentType}
          onChange={(e) => {
            const selectedType = e.target.value
            setDocumentType(selectedType)
            setDocumentSubtype("")
            if (selectedType === "custom") {
              setIsCustomType(true)
              setSubtypeOptions([])
            } else {
              setIsCustomType(false)
              setSubtypeOptions(Object.keys(decisionTree[selectedType]?.subtype || {}))
            }
          }}
          className="w-full border rounded p-2 mb-4"
        >
          <option value="">Select Type</option>
          {Object.keys(decisionTree).map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
          <option value="custom">Add Custom Type</option>
        </select>
        {isCustomType && (
          <div>
            <label className="block text-gray-700 font-medium mb-2">Custom Type:</label>
            <input
              type="text"
              value={customType}
              onChange={(e) => setCustomType(e.target.value)}
              placeholder="Enter custom type"
              className="w-full border rounded p-2 mb-4"
            />
          </div>
        )}
        <label className="block text-gray-700 font-medium mb-2">Document Subtype:</label>
        <input
          type="text"
          value={isCustomType ? customSubtype : documentSubtype}
          onChange={(e) => {
            if (isCustomType) {
              setCustomSubtype(e.target.value)
            } else {
              setDocumentSubtype(e.target.value)
            }
          }}
          placeholder="Enter subtype"
          className="w-full border rounded p-2 mb-4"
          required
        />
        <label className="block text-gray-700 font-medium mb-2">Template For:</label>
        <select
          value={requiredRole}
          onChange={(e) => setRequiredRole(e.target.value)}
          className="border rounded p-2 mb-4"
          required
        >
          <option value="">Select Role</option>
          <option value="student">Student</option>
          <option value="organization">Organization</option>
        </select>
        <label className="block text-gray-700 font-medium mb-2">Suborganization:</label>
        {suborgs.length === 0 ? (
          <div className="border rounded p-2 w-full text-gray-500">
            No suborganizations under {user.organization?.name}
          </div>
        ) : (
          <select
            value={selectedSubOrg.length === 0 ? "" : selectedSubOrg}
            onChange={(e) => {
              const value = e.target.value
              setSelectedSubOrg(value === "" ? [] : value)
            }}
            className="border rounded p-2 mb-4"
          >
            <option value="">For general use (under {user.organization?.name})</option>
            {suborgs.map((org) => (
              <option key={org._id} value={org._id}>
                {org.firstname || "(No Name)"}
              </option>
            ))}
          </select>
        )}
        <label className="block text-gray-700 font-medium mb-2">Strict Mode:</label>
        <input type="checkbox" checked={strictMode} onChange={toggleStrictMode} className="mr-2" />
        Enable strict mode
        <label className="block text-gray-700 font-medium mb-2">Paper Size:</label>
        <select
          value={paperSize}
          onChange={(e) => setPaperSize(e.target.value)}
          disabled={editorLoaded}
          className="border rounded p-2 mb-4"
          required
        >
          <option value="letter">Letter (8.5in x 11in)</option>
          <option value="legal">Legal (8.5in x 14in)</option>
          <option value="a4">A4 (8.27in x 11.69in)</option>
        </select>
        <h2 className="text-xl font-medium mb-4">Margins (in inches):</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Top Margin:</label>
            <input
              type="number"
              step="0.1"
              name="top"
              value={margins.top}
              onChange={handleMarginChange}
              className="w-full border rounded p-2 mb-4"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Bottom Margin:</label>
            <input
              type="number"
              step="0.1"
              name="bottom"
              value={margins.bottom}
              onChange={handleMarginChange}
              className="w-full border rounded p-2 mb-4"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Left Margin:</label>
            <input
              type="number"
              step="0.1"
              name="left"
              value={margins.left}
              onChange={handleMarginChange}
              className="w-full border rounded p-2 mb-4"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Right Margin:</label>
            <input
              type="number"
              step="0.1"
              name="right"
              value={margins.right}
              onChange={handleMarginChange}
              className="w-full border rounded p-2 mb-4"
            />
          </div>
        </div>
        <button
          onClick={() => {
            if (!documentName || (!documentType && !customType) || !requiredRole || !paperSize) {
              showMessage("Please fill in all required fields before starting template creation.", "error")
              return
            }
            setEditorLoaded(true)
          }}
          disabled={editorLoaded}
          className={`bg-[#38b6ff] text-white py-2 px-4 rounded hover:bg-[#2a9ed6] ${editorLoaded ? "hidden" : ""}`}
        >
          Begin Template Creation
        </button>
      </div>

      {editorLoaded && (
        <>
          {/* Pagination Controls */}
          <div className="mb-4 flex justify-between">
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
            {/* Auto-save Status Indicator */}
            <div className="flex items-center gap-4 text-green-600 text-sm font-bold">
              {autoSaveStatus === "success" && (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span>Auto-saved</span>
                </>
              )}
              {autoSaveStatus === "error" && (
                <>
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-red-500">Failed to save</span>
                </>
              )}
              {autoSaveStatus === "pending" && (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              )}
              {!autoSaveStatus && templateId && <span className="text-green-400">Saved</span>}
            </div>
            <button onClick={handleAddPage} className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700">
              Add Page
            </button>
            <button onClick={handleDeletePage} className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-700">
              Delete Page
            </button>
          </div>

          {/* Editors */}
          {pages.map((page) => (
            <div key={page.id} style={{ display: currentPage === page.id ? "block" : "none" }}>
              <Editor
                apiKey="iao6fh65t97ayqmiahlxmxlj0bh94ynxw83kfyh0vbqaig9y"
                value={page.content}
                init={{
                  height: selectedPageSize.height,
                  menubar: "favs file edit view insert format tools table help",
                  plugins: [
                    "advlist",
                    "autolink",
                    "link",
                    "image",
                    "lists",
                    "pagebreak",
                    "charmap",
                    "preview",
                    "anchor",
                    "searchreplace",
                    "wordcount",
                    "visualblocks",
                    "code",
                    "fullscreen",
                    "insertdatetime",
                    "media",
                    "table",
                    "emoticons",
                    "help",
                  ],
                  toolbar:
                    "undo redo | styles | bold italic underline | fontsize fontfamily | addDraggableImage | addHeaderImage addFooterImage | markEditable removeEditable | lineheight pagebreak| " +
                    "alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | addHangingIndent removeHangingIndent | " +
                    "link image | fullscreen | forecolor backcolor emoticons | help",
                  object_resizing: "img",
                  fontsize_formats: "8pt 10pt 12pt 14pt 18pt 24pt 36pt",
                  line_height_formats: "1 1.1 1.15 1.2 1.3 1.5 2",
                  font_family_formats:
                    "Andale Mono=andale mono,times; " +
                    "Arial=arial,helvetica,sans-serif; " +
                    "Arial Black=arial black,avant garde; " +
                    "Book Antiqua=book antiqua,palatino; " +
                    "Century Gothic=Century Gothic,sans-serif; " +
                    "Comic Sans MS=comic sans ms,sans-serif; " +
                    "Courier New=courier new,courier; " +
                    "Georgia=georgia,palatino; " +
                    "Helvetica=helvetica; " +
                    "Palatino Linotype=Palatino Linotype,serif; " +
                    "Impact=impact,chicago; " +
                    "Questrial=Questrial,sans-serif; " +
                    "Symbol=symbol; " +
                    "Tahoma=tahoma,arial,helvetica,sans-serif; " +
                    "Terminal=terminal,monaco; " +
                    "Times New Roman=times new roman,times; " +
                    "Trebuchet MS=trebuchet ms,geneva; " +
                    "Verdana=verdana,geneva; ",
                  content_style: sharedStyles,
                  browser_spellcheck: true,
                  contextmenu: false, // Disable TinyMCE's default context menu to allow browser's spell check menu
                  setup: (editor) => {
                    // Rest of your setup code...

                    editor.on("drop", (event) => {
                      event.preventDefault() // Prevent TinyMCE's default drop handling
                      event.stopPropagation() // Stop propagation of the event to prevent other handlers
                    })

                    editor.on("init", () => {
                      const iframeDoc = editor.getDoc() // Access TinyMCE's iframe document
                      const editorBody = editor.getBody()

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

                      // Listen for any content changes that might not be caught by onEditorChange
                      editor.on("ExecCommand", (e) => {
                        // This catches most editor commands like formatting, inserting elements, etc.
                        triggerAutoSave()
                      })

                      editor.on("SetContent", (e) => {
                        // This catches direct content setting operations
                        if (!e.initial) {
                          // Skip the initial content setting
                          triggerAutoSave()
                        }
                      })
                    })

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
                              showMessage("Failed to add image. Please try again.", "error")
                            }
                          }
                        }
                        input.click()
                      },
                    })

                    // Add Header Image Button
                    editor.ui.registry.addButton("addHeaderImage", {
                      text: "Add Header",
                      icon: "image",
                      tooltip: "Add Header Image",
                      onAction: () => handleHeaderFooterUpload(editor, "header"),
                    })

                    // Add Footer Image Button
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

                    // ------------ Method 1: Count newlines based sa exceeding ng width

                    editor.on("keydown", (event) => {
                      const lineHeight = Number.parseFloat(window.getComputedStyle(editor.getBody()).lineHeight) || 20
                      const pageHeightPx = selectedPageSize.height
                      const marginTopPx = margins.top * DPI
                      const marginBottomPx = margins.bottom * DPI
                      const availableHeight = pageHeightPx - (marginTopPx + marginBottomPx)
                      const maxLines = Math.floor(availableHeight / lineHeight)
                      const maxTextWidth = selectedPageSize.width - (margins.left * DPI + margins.right * DPI)
                      const textContent = editor.getContent({
                        format: "text",
                      })

                      let currentLines = 1 // laging start at line 1
                      let currentLineWidth = 0

                      for (const char of textContent) {
                        const charWidth = 13.2 // approx width per char

                        if (currentLineWidth + charWidth > maxTextWidth) {
                          // increment line count pag exceeds
                          currentLines++
                          currentLineWidth = charWidth // new line count
                        } else {
                          currentLineWidth += charWidth
                        }
                      }

                      // Prevent typing if beyond max lines na
                      if (currentLines >= maxLines && (event.key === "Enter" || event.key.length === 1)) {
                        console.log("Typing blocked: max lines reached!")
                        event.preventDefault() // Stop Enter and typing beyond max lines
                      }
                    })

                    // ------------ Method 2: Count newlines based sa number of Enters

                    editor.on("keydown", (event) => {
                      const lineHeight = Number.parseFloat(window.getComputedStyle(editor.getBody()).lineHeight) || 20
                      const pageHeightPx = selectedPageSize.height
                      const marginTopPx = margins.top * DPI
                      const marginBottomPx = margins.bottom * DPI
                      const availableHeight = pageHeightPx - (marginTopPx + marginBottomPx) + lineHeight
                      const maxLines = Math.floor(availableHeight / lineHeight)
                      const textContent = editor.getContent({
                        format: "text",
                      })
                      const lines = textContent.split("\n")
                      const currentLines = lines.length
                      const maxTextWidth = selectedPageSize.width - (margins.left * DPI + margins.right * DPI)

                      // approx last line width (since walang exact from TinyMCE)
                      const lastLine = lines[lines.length - 1] || ""
                      const lastLineWidthPx = lastLine.length * 7

                      // Prevent typing pag beyond max lines
                      if (currentLines >= maxLines && event.key === "Enter") {
                        console.log("Typing blocked: max lines reached!")
                        event.preventDefault() // Stop Enter key
                      }

                      // Prevent typing pag beyond max width sa last line
                      if (currentLines >= maxLines && lastLineWidthPx >= maxTextWidth && event.key.length === 1) {
                        console.log("Typing blocked: max width reached!")
                        event.preventDefault() // Stop adding characters beyond horizontal limit
                      }
                    })

                    editor.ui.registry.addButton("markEditable", {
                      text: "Mark Editable",
                      onAction: () => {
                        const content = editor.selection.getContent()
                        editor.selection.setContent(`<span class="editable">${content}</span>`)
                      },
                    })

                    editor.ui.registry.addButton("removeEditable", {
                      text: "Remove Editable",
                      onAction: () => {
                        const content = editor.selection.getContent()
                        editor.selection.setContent(content.replace(/<span class="editable">(.*?)<\/span>/g, "$1"))
                      },
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
                onEditorChange={(content, editor) => {
                  handleEditorChange(content, editor, page.id)
                }}
              />
            </div>
          ))}

          <div className="mt-4 flex gap-4">
            <button
              onClick={handleSaveOrUpdateTemplate}
              className="bg-[#4CAF50] text-white py-2 px-4 rounded hover:bg-[#45a049] flex items-center gap-2 transform hover:scale-105 transition-all duration-200"
            >
              <Save className="text-white" />
              {isUpdateMode ? "Update Template" : "Save Template"}
            </button>
            <button
              onClick={handlePrintDocument}
              className="bg-[#38b6ff] text-white py-2 px-4 rounded hover:bg-[#1a8cd8] flex items-center gap-2 hover:scale-105"
            >
              <Printer className="text-white" /> Print Document
            </button>
          </div>
        </>
      )}
      {/* Mini Message Box (Centered) */}
      {message && (
        <div
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
        p-4 rounded shadow-lg bg-white text-center w-80 z-50 flex items-center justify-center gap-2"
        >
          {message.type === "success" && <CheckCircle className="h-5 w-5 text-green-500" />}
          {message.type === "error" && <XCircle className="h-5 w-5 text-red-500" />}
          {message.type === "info" && <Loader className="h-5 w-5 text-blue-500" />}
          {message.type !== "success" && message.type !== "error" && message.type !== "info" && (
            <Loader className="h-5 w-5 text-orange-500" />
          )}
          <span
            className={`
      ${message.type === "success" ? "text-green-500" : ""}
      ${message.type === "error" ? "text-red-500" : ""}
      ${message.type === "info" ? "text-blue-500" : ""}
      ${message.type !== "success" && message.type !== "error" && message.type !== "info" ? "text-orange-500" : ""}
    `}
          >
            {message.text}
          </span>
        </div>
      )}
    </div>
  )
}

export default TemplateContainer

// latest na tlga itows
