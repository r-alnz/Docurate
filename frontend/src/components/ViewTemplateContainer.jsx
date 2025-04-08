"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Editor } from "@tinymce/tinymce-react"
import { getToken } from "../utils/authUtil.js"
import { getTemplateById } from "../services/templateService.js"
import { X } from "lucide-react"

const ViewTemplateContainer = () => {
  const { id } = useParams()
  const [pages, setPages] = useState([{ id: 1, content: "" }])
  const [currentPage, setCurrentPage] = useState(1)
  const [documentName, setDocumentName] = useState("")
  const [documentType, setDocumentType] = useState("")
  const [documentSubtype, setDocumentSubtype] = useState("")
  const [requiredRole, setRequiredRole] = useState("student")
  const [paperSize, setPaperSize] = useState("letter")
  const [isLoading, setIsLoading] = useState(true)
  const [margins, setMargins] = useState({ top: 1, right: 1, bottom: 1, left: 1 })
  const editorRef = useRef(null)
  const navigate = useNavigate()

  const DPI = 96
  const pageSizes = useMemo(
    () => ({
      letter: { width: DPI * 8.5, height: DPI * 11 },
      legal: { width: DPI * 8.5, height: DPI * 14 },
      a4: { width: DPI * 8.27, height: DPI * 11.69 },
    }),
    [DPI],
  )

  const selectedPageSize = pageSizes[paperSize]

  // Memoize styles to prevent recalculation
  const sharedStyles = useMemo(
    () => `
    @font-face {
      font-family: 'Century Gothic';
      src: local('Century Gothic'),
          url('/fonts/CenturyGothic.woff2') format('woff2'),
          url('/fonts/CenturyGothic.woff') format('woff'),
          url('/fonts/CenturyGothic.ttf') format('truetype');
      font-weight: normal;
      font-style: normal;
      font-display: swap; /* Improve font loading performance */
    }

    /* Other styles remain the same */
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
    }

    .page, .mce-content-body {
      position: relative;
      width: ${selectedPageSize.width / DPI}in;
      min-height: ${selectedPageSize.height / DPI + 1}in;
      max-height: ${selectedPageSize.height / DPI + 1}in;
      padding: ${DPI * margins.top}px ${DPI * margins.right}px ${DPI * margins.bottom}px ${DPI * margins.left}px;
      box-sizing: border-box;
      margin: 2.6rem auto;
      background-color: white;
      border: 1px solid #ddd;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      font-size: 12pt;
      line-height: 1.15;
    }
  `,
    [selectedPageSize, margins, DPI],
  )

  // Only load the current page content
  const currentPageContent = useMemo(() => {
    const page = pages.find((p) => p.id === currentPage)
    return page ? page.content : ""
  }, [pages, currentPage])

  useEffect(() => {
    if (id) {
      const loadTemplate = async () => {
        setIsLoading(true)
        try {
          const token = getToken()
          const templateData = await getTemplateById(id, token)

          setDocumentName(templateData.name)
          setDocumentType(templateData.type)
          setDocumentSubtype(templateData.subtype || "")
          setRequiredRole(templateData.requiredRole)
          setPaperSize(templateData.paperSize)

          if (templateData?.margins) {
            setMargins({
              top: templateData.margins.top,
              bottom: templateData.margins.bottom,
              left: templateData.margins.left,
              right: templateData.margins.right,
            })
          }

          // Process pages more efficiently
          const pageContents = templateData.content.split('<hr style="page-break-after: always;">')
          setPages(
            pageContents.map((content, index) => ({
              id: index + 1,
              content,
            })),
          )
        } catch (error) {
          console.error("Error loading template:", error.message)
        } finally {
          setIsLoading(false)
        }
      }
      loadTemplate()
    }
  }, [id])

  // TinyMCE initialization options - memoized to prevent recreating on each render
  const editorInit = useMemo(
    () => ({
      height: selectedPageSize.height,
      menubar: false,
      toolbar: false,
      readonly: true,
      content_style: sharedStyles,
      plugins: ["advlist", "autolink", "link", "image", "lists", "pagebreak"],
      object_resizing: "img",
      browser_spellcheck: false,
      contextmenu: false,
      setup: (editor) => {
        // Optimize editor setup
        editor.on("init", () => {
          console.log("Editor initialized")
        })
      },
    }),
    [selectedPageSize.height, sharedStyles],
  )

  return (
    <div className="p-4">
      <div className="flex justify-end">
        <button
          onClick={() => navigate("/user-templates")}
          className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 cursor-pointer"
        >
          <X className="text-white" />
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
          <p className="mt-4 text-lg">Loading template...</p>
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-4">{documentName}</h1>
          <div className="mb-4 border p-4 rounded shadow">
            <h2 className="text-xl font-medium mb-4">Template Information</h2>
            <p className="mb-2">
              <strong>Type:</strong> {documentType}
            </p>
            <p className="mb-2">
              <strong>Subtype:</strong> {documentSubtype || "N/A"}
            </p>
            <p className="mb-2">
              <strong>Role:</strong> {requiredRole}
            </p>
            <p className="mb-2">
              <strong>Paper Size:</strong> {paperSize}
            </p>
          </div>

          {/* Pagination Controls */}
          <div className="mb-4 flex justify-between">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 disabled:opacity-50"
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {pages.length}
            </span>
            <button
              disabled={currentPage === pages.length}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 disabled:opacity-50"
            >
              Next
            </button>
          </div>

          {/* Only render one editor instance */}
          <Editor
            apiKey="iao6fh65t97ayqmiahlxmxlj0bh94ynxw83kfyh0vbqaig9y"
            onInit={(evt, editor) => (editorRef.current = editor)}
            value={currentPageContent}
            init={editorInit}
          />
        </>
      )}
    </div>
  )
}

export default ViewTemplateContainer
