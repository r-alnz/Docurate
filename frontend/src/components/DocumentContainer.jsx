import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Editor } from '@tinymce/tinymce-react';
import { getToken } from '../utils/authUtil';
import { createDocument, updateDocument, getDocumentById } from '../services/documentService';
import { getTemplateById } from '../services/templateService';
import imageCompression from 'browser-image-compression';

const DocumentContainer = () => {
    const { id, templateId } = useParams(); // `id` for the document and `templateId` for creating based on a template
    const [pages, setPages] = useState([{ id: 1, content: '' }]);
    const [currentPage, setCurrentPage] = useState(1);
    const [title, setTitle] = useState('');
    const [template, setTemplate] = useState(null);
    const [paperSize, setPaperSize] = useState('letter');
    const [isUpdateMode, setIsUpdateMode] = useState(false);
    const navigate = useNavigate();
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [message, setMessage] = useState(null);

    const DPI = 96; // Fixed DPI for page dimensions
    const pageSizes = {
        letter: { width: DPI * 8.5, height: DPI * 11 },
        legal: { width: DPI * 8.5, height: DPI * 14 },
        a4: { width: DPI * 8.27, height: DPI * 11.69 },
    };

    const selectedPageSize = pageSizes[paperSize];


    const [margins, setMargins] = useState({
        top: 1,
        bottom: 1,
        left: 1,
        right: 1,
    });

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

    .header, .footer {
        max-height: ${DPI - DPI / 3}px;
        position: relative;
        margin: ${margins.top}in ${margins.right}in ${margins.bottom}in ${margins.left}in;
        overflow: hidden;
    }

    .footer {
        margin: -0.70in -0.70in; /* Adjust for the footer */
    }

    .header img, .footer img {
        width: 100%;
        height: auto;
        display: block;
    }

    .page, .mce-content-body {
        position: relative;
        width: ${selectedPageSize.width / DPI}in;
        min-height: ${(selectedPageSize.height / DPI) + 1}in;
        max-height: ${(selectedPageSize.height / DPI) + 1}in;
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
        border: 1px dashed #ccc;
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

    @media print {
    div[style*="dashed"] {
        display: none !important;
    }
    }

    // .editor-container {
    //     position: relative;
    //     width: 100%;
    //     height: ${selectedPageSize.height / DPI}in;
    //     overflow: hidden;
    // }

    // .editor-inner {
    //     position: absolute;
    //     top: var(--top-margin);
    //     left: var(--left-margin);
    //     right: var(--right-margin);
    //     bottom: var(--bottom-margin);
    //     overflow: hidden;
    //     max-height: calc(100% - var(--top-margin) - var(--bottom-margin));
    // }
    
    `;

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
            // padding: ${margins.top}in ${margins.right}in ${margins.bottom}in ${margins.left}in;
            padding: ${margins.top - 0.25}in ${margins.right - 0.25}in ${margins.bottom - 0.25}in ${margins.left - 0.25}in;

            box-sizing: border-box;
            background-color: white;
            overflow: hidden;
            page-break-after: always;
        }

        .header, .footer {
            position: absolute;
            left: 0;
            max-height: ${DPI}px;
            width: 100%;
            margin: 0;
            padding: 0;
            overflow: hidden;
        }

        .header {
            top: 0;
        }

        .footer {
            bottom: 0;
        }

        .header img, .footer img {
            width: 100%;
            height: auto;
            display: block;
        }

        p {
            margin: 0;
            margin-bottom: 8pt;
        }
    `;

    useEffect(() => {
        const loadDocumentOrTemplate = async () => {
            try {
                const token = getToken();
                if (id) {
                    const documentData = await getDocumentById(id, token);


                    if (documentData?.template?.margins) {
                        const { top, bottom, left, right } = documentData.template.margins;
                        setMargins({
                            top: typeof top === 'number' ? top : 1,
                            bottom: typeof bottom === 'number' ? bottom : 1,
                            left: typeof left === 'number' ? left : 1,
                            right: typeof right === 'number' ? right : 1,
                        });
                    }

                    setTitle(documentData.title);
                    setTemplate(documentData.template);
                    setPaperSize(documentData.template?.paperSize);

                    setPages(
                        documentData.content.split('<hr style="page-break-after: always;">').map((content, index) => ({
                            id: index + 1,
                            content,
                        }))
                    );

                    setIsUpdateMode(true);
                } else if (templateId) {
                    const templateData = await getTemplateById(templateId, token);

                    console.log(templateData);
                    if (templateData?.margins) { // Check if margins exist
                        console.log(1);
                        const { top, bottom, left, right } = templateData.margins;
                        setMargins({
                            top: top,
                            bottom: bottom,
                            left: left,
                            right: right,
                        });
                    }

                    setTemplate(templateData);
                    setPaperSize(templateData.paperSize); // Lock paper size for updates
                    setPages(
                        templateData.content.split('<hr style="page-break-after: always;">').map((content, index) => ({
                            id: index + 1,
                            content,
                        }))
                    );
                }
                setIsDataLoaded(true); // Mark data as loaded
            } catch (error) {
                console.error('Error loading data:', error.message);
                showMessage('Failed to load data. Please try again.');
            }
        };

        loadDocumentOrTemplate();
    }, [id, templateId]);

    const compressImage = async (file) => {
        const options = {
            maxSizeMB: 0.5, // Reduced max file size in MB for higher compression
            maxWidthOrHeight: 1280, // Smaller dimensions for greater compression
            useWebWorker: true, // Use Web Workers for faster processing
        };
        try {
            return await imageCompression(file, options);
        } catch (error) {
            console.error('Image compression error:', error);
            throw new Error('Failed to compress image');
        }
    };


    const addImageToEditor = (editor, file) => {
        const reader = new FileReader();
        reader.onload = () => {
            editor.insertContent(`<img src="${reader.result}" alt="Compressed Image" />`);
        };
        reader.readAsDataURL(file);
    };

    const handleImageUpload = (editor) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async () => {
            const file = input.files[0];
            if (file) {
                try {
                    const compressedFile = await compressImage(file);
                    addImageToEditor(editor, compressedFile);
                } catch (error) {
                    console.error('Error compressing image:', error.message);
                    showMessage('Failed to compress and insert image. Please try again.');
                }
            }
        };
        input.click();
    };

    const insertHeaderFooterImage = (editor, position, file) => {
        const reader = new FileReader();
        reader.onload = () => {
            const imageHtml = `
                <div class="${position}">
                    <img src="${reader.result}" alt="${position} image" />
                </div>
            `;
            editor.insertContent(imageHtml);
        };
        reader.readAsDataURL(file);
    };

    const handleHeaderFooterUpload = (editor, position) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async () => {
            const file = input.files[0];
            if (file) {
                try {
                    const compressedFile = await compressImage(file);
                    insertHeaderFooterImage(editor, position, compressedFile);
                } catch (error) {
                    console.error('Error compressing header/footer image:', error.message);
                    showMessage('Failed to add header/footer image. Please try again.');
                }
            }
        };
        input.click();
    };


    const handleEditorChange = (content, pageId) => {
        setPages((prevPages) =>
            prevPages.map((page) => (page.id === pageId ? { ...page, content } : page))
        );
    };


    const handleAddPage = () => {
        setPages((prevPages) => [
            ...prevPages,
            { id: prevPages.length + 1, content: '' },
        ]);
        setCurrentPage(pages.length + 1);
    };

    const handleDeletePage = () => {
        if (pages.length > 1) {
            const confirmed = window.confirm('Are you sure you want to delete this page?');
            if (confirmed) {
                const newPages = pages.filter((page) => page.id !== currentPage);
                setPages(newPages);
                setCurrentPage((prev) => (prev > newPages.length ? newPages.length : prev));
            }
        } else {
            showMessage('You cannot delete the last page!');
        }
    };

    const handleNextPage = () => {
        if (currentPage < pages.length) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const showMessage = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage(null), 3000); // Auto-hide after 3 seconds
    };

    const handleSaveOrUpdateDocument = async () => {
        if (!title || pages.length === 0) {
            showMessage('⚠️ Please fill in all required fields and ensure there is content.', 'warning');
            return;
        }

        const combinedContent = pages.map((page) => page.content).join('<hr style="page-break-after: always;">');

        const documentData = {
            title,
            template: template?._id,
            content: combinedContent,
            margins,
        };

        try {
            const token = getToken();
            if (isUpdateMode) {
                await updateDocument(id, documentData, token);
                showMessage('✅ Document updated successfully!', 'success');
            } else {
                await createDocument(documentData, token);
                showMessage('✅ Document created successfully!', 'success');
                navigate('/documents');
            }
        } catch (error) {
            console.error('Error saving/updating document:', error.message);
            showMessage('❌ Failed to save/update document. Please try again.', 'error');
        }
    };

    const handlePrintDocument = () => {
        const iframe = document.createElement('iframe');
        document.body.appendChild(iframe);
        const iframeDoc = iframe.contentWindow.document;

        // Get the font family from the editor dynamically
        //const editorContentBody = document.querySelector('.mce-content-body');
        // const editorFontFamily = window.getComputedStyle(editorContentBody).fontFamily;

        // Combine content of all pages
        const combinedContent = pages
            .map(
                (page) => `
                <div class="page">
                    ${page.content.trim() || '<p>&nbsp;</p>'}
                </div>
            `
            )
            .join('');
    
        iframeDoc.open();
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
                            
                        // body::before {
                        //     content: "";
                        //     position: absolute;
                        //     top: var(--margin-top, 1in);
                        //     left: var(--margin-left, 1in);
                        //     right: var(--margin-right, 1in);
                        //     bottom: var(--margin-bottom, 1in);
                        //     border: 2px dashed red;
                        //     pointer-events: none; /* Prevents interaction */
                        //     box-sizing: border-box;
                        // }

                    </style>
                </head>
                <body>
                    ${combinedContent}
                </body>
            </html>
        `);
        iframeDoc.close();
    
        const iframeWindow = iframe.contentWindow;
    
        // Ensure images load before printing
        const images = iframeDoc.getElementsByTagName('img');
        const promises = Array.from(images).map((img) => {
            return new Promise((resolve) => {
                if (img.complete) {
                    resolve();
                } else {
                    img.onload = resolve;
                    img.onerror = resolve;
                }
            });
        });
    
        Promise.all(promises).then(() => {
            iframeWindow.focus();
            iframeWindow.print();
            document.body.removeChild(iframe); // Cleanup the iframe
        });
    };

    const addDraggableImage = (editor, file) => {
        const reader = new FileReader();
        reader.onload = () => {
            const uniqueId = `draggable-${Date.now()}`;
            const imageHtml = `
                <img
                    id="${uniqueId}"
                    src="${reader.result}"
                    alt="Draggable Image"
                    class="draggable-image"
                    style="position: absolute; top: 50px; left: 50px; display: block; cursor: move; z-index: 1000;"
                />
            `;
            editor.insertContent(imageHtml);
        };
        reader.readAsDataURL(file);
    };

    // const handleEditorInit = (editor) => {
    //     editor.on("init", () => {
    //       setTimeout(() => {
    //         const iframe = editor.iframeElement;
    //         if (!iframe) return;
      
    //         const doc = iframe.contentDocument || iframe.contentWindow.document;
    //         if (!doc) return;
      
    //         const body = doc.body;
    //         if (!body) return;
      
    //         // const marginOverlay = doc.createElement("div");
    //         // marginOverlay.style.position = "absolute";
    //         // marginOverlay.style.top = `${margins.top}in`;
    //         // marginOverlay.style.left = `${margins.left}in`;
    //         // marginOverlay.style.width = `calc(100% - ${margins.left + margins.right}in)`;
    //         // marginOverlay.style.height = `calc(100% - ${margins.top + margins.bottom}in)`;
    //         // marginOverlay.style.border = "2px dashed red";
    //         // marginOverlay.style.pointerEvents = "none"; // No interaction
    //         // marginOverlay.style.userSelect = "none"; // Prevents selection
    //         // marginOverlay.style.contentEditable = "false"; // Blocks edits
    //         // marginOverlay.style.cursor = "none"; // Hides the cursor
    //         // marginOverlay.style.zIndex = "0";
    //         // marginOverlay.classList.add("no-print");
            
    //         // body.appendChild(marginOverlay);
      
    //         // // Hide margin overlay during printing
    //         // const style = doc.createElement("style");
    //         // style.textContent = "@media print { .no-print { display: none !important; } }";
    //         // doc.head.appendChild(style);
    //       }, 50);
    //     });
      
    //     editor.on('keydown', (event) => {
    //         // Allow common shortcuts (Ctrl+A, Ctrl+C, Ctrl+V, etc.)
    //         // if (event.ctrlKey || event.metaKey) {
    //         //   return;
    //         // }
          
    //         const range = editor.selection.getRng();
    //         const cursorRect = range.getBoundingClientRect();
    //         const iframe = editor.iframeElement;
    //         if (!iframe) return;
          
    //         const doc = iframe.contentDocument || iframe.contentWindow.document;
    //         const marginBox = doc.querySelector(".no-print");
    //         if (!marginBox) return;
          
    //         const marginRect = marginBox.getBoundingClientRect();
          
    //         const isVerticalOverflow = cursorRect.bottom + 5 >= marginRect.bottom && cursorRect.left > marginRect.left;
    //         const isHorizontalOverflow = cursorRect.right + 10 >= marginRect.right;

    //         const allowedKeys = ["Backspace", "Delete", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];

    //         if ((isVerticalOverflow || isHorizontalOverflow) && !allowedKeys.includes(event.key) &&     !(event.ctrlKey) // Allow Ctrl + A
    //         ) {
    //             event.preventDefault();
    //             alert("You have reached the typing limit of this page.");
    //             editor.execCommand("Delete"); // Deletes the last character
    //         }

    //         // //  undo the last type
    //         // const content = editor.getContent({ format: "html" });
    //         // if (content.length > 0) {
    //         //   editor.setContent(content.slice(0, -1)); // Remove only the last typed character
    //         // }
    //     //     }
    //     });
          
    //   };
               
      

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">{isUpdateMode ? 'Edit Document' : 'Create New Document'}</h1>
            <div className="mb-4 border p-4 rounded shadow">
                <h2 className="text-xl font-medium mb-4">Document Information</h2>
                <label className="block text-gray-700 font-medium mb-2">Title:</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter document title"
                    className="w-full border rounded p-2 mb-4"
                />
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
                    <span>Page {currentPage} of {pages.length}</span>
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
                    <button
                        onClick={handleAddPage}

                        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
                    >
                        Add Page
                    </button>
                    <button
                        onClick={handleDeletePage}
                        className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-700"
                    >
                        Delete Page
                    </button>
                </div>

                {isDataLoaded ? (pages.map((page) => (
                    <div key={page.id} style={{ display: currentPage === page.id ? 'block' : 'none' }}>
                        <Editor
                            apiKey="
kvl4klipvu2pnd3pytjngbf7tvr4h6n548r9ksy1pp3ax6fu"
                            value={page.content}
                            init={{
                                height: selectedPageSize.height,
                                menubar: true,
                                plugins: [
                                    'advlist', 'autolink', 'lists', 'link', 'image', 'lists', 'pagebreak',
                                    'searchreplace', 'wordcount', 'code', 'fullscreen',
                                    'insertdatetime', 'media', 'table', 'paste', 'code', 'help', 'wordcount'
                                ],
                                toolbar:
                                    'undo redo | formatselect | bold italic backcolor | ' +
                                    'alignleft aligncenter alignright alignjustify | ' +
                                    'bullist numlist outdent indent | addDraggableImage | addHangingIndent removeHangingIndent | addHeaderImage addFooterImage | help',
                                content_style: sharedStyles,
                                readonly: 1,
                                browser_spellcheck: true,
                                setup: (editor) => {          
                                    
                                    // handleEditorInit(editor);

                                    editor.on('drop', (event) => {
                                        event.preventDefault(); // Prevent TinyMCE's default drop handling
                                        event.stopPropagation(); // Stop propagation of the event to prevent other handlers
                                    });

                                    editor.on('init', () => {

                                        // editor.getContainer().style.height = `${selectedPageSize.height + 300}px`;

                                        // setTimeout(() => {
                                        //     const contentBody = editor.getBody();
                                        //     if (contentBody) { // Ensure it's not null
                                        //         // contentBody.style.overflow = 'hidden'; // Hide overflow content
                                        //         contentBody.style.maxHeight = `calc(100% - ${topMargin}px - ${bottomMargin}px)`;
                                        //     }
                                        // }, 50); // Small delay to ensure initialization

                                        // // 🔹 Enforce Page Clipping
                                        // const contentBody = editor.getBody();
                                        // contentBody.style.overflow = 'hidden'; // Hide overflow content
                                        // contentBody.style.maxHeight = `calc(100% - ${topMargin}px - ${bottomMargin}px)`;

                                        const iframeDoc = editor.getDoc(); // Access TinyMCE's iframe document

                                        iframeDoc.addEventListener('mousedown', (e) => {
                                            const target = e.target.closest('.draggable-image');
                                            if (!target) return;

                                            let offsetX = e.clientX - target.offsetLeft;
                                            let offsetY = e.clientY - target.offsetTop;

                                            const onMouseMove = (event) => {
                                                target.style.left = `${event.clientX - offsetX}px`;
                                                target.style.top = `${event.clientY - offsetY}px`;
                                            };

                                            const onMouseUp = () => {
                                                iframeDoc.removeEventListener('mousemove', onMouseMove);
                                                iframeDoc.removeEventListener('mouseup', onMouseUp);

                                                // Update TinyMCE's content
                                                const uniqueId = target.getAttribute('id');
                                                if (uniqueId) {
                                                    const tinyTarget = editor.dom.get(uniqueId);
                                                    editor.dom.setStyles(tinyTarget, {
                                                        left: target.style.left,
                                                        top: target.style.top,
                                                    });

                                                    // Synchronize TinyMCE content
                                                    const updatedContent = editor.getContent();
                                                    editor.setContent(updatedContent);

                                                    // Trigger TinyMCE's change event to ensure synchronization
                                                    editor.undoManager.add();
                                                    editor.fire('change');
                                                    console.log(editor.getContent()); // Verify updated content
                                                } else {
                                                    console.warn('Draggable image has no ID. Ensure unique IDs are assigned.');
                                                }
                                            };

                                            iframeDoc.addEventListener('mousemove', onMouseMove);
                                            iframeDoc.addEventListener('mouseup', onMouseUp);
                                        });
                                    });



                                    editor.ui.registry.addButton('addDraggableImage', {
                                        text: 'Insert Image',
                                        icon: 'image',
                                        onAction: () => {
                                            const input = document.createElement('input');
                                            input.type = 'file';
                                            input.accept = 'image/*';
                                            input.onchange = async () => {
                                                const file = input.files[0];
                                                if (file) {
                                                    try {
                                                        addDraggableImage(editor, file);
                                                    } catch (error) {
                                                        console.error('Error adding draggable image:', error.message);
                                                        showMessage('Failed to add image. Please try again.');
                                                    }
                                                }
                                            };
                                            input.click();
                                        },
                                    });

                                    editor.on('keydown', (event) => {
                                        if (event.key === 'Tab') {
                                            event.preventDefault(); // Prevent default tab behavior
                                            const selection = editor.selection;
                                            const content = selection.getContent({ format: 'html' });

                                            // Insert a "tab" as multiple non-breaking spaces
                                            const tabEquivalent = '&nbsp;&nbsp;&nbsp;&nbsp;'; // 4 spaces (adjust as needed)
                                            const newContent = `${tabEquivalent}${content}`;
                                            selection.setContent(newContent);
                                        }
                                    });

                                    editor.ui.registry.addButton('addHeaderImage', {
                                        text: 'Add Header Image',
                                        icon: 'image',
                                        onAction: () => handleHeaderFooterUpload(editor, 'header'),
                                    });
                                    editor.ui.registry.addButton('addFooterImage', {
                                        text: 'Add Footer Image',
                                        icon: 'image',
                                        onAction: () => handleHeaderFooterUpload(editor, 'footer'),
                                    });

                                    // editor.ui.registry.addButton('addImage', {
                                    //     text: 'Add Image',
                                    //     icon: 'image',
                                    //     onAction: () => handleImageUpload(editor),
                                    // });

                                    // Prevent interaction outside of editable spans within non-editable blocks
                                    editor.on('BeforeExecCommand', (e) => {
                                        const selectedNode = editor.selection.getNode();
                                        if (selectedNode.closest('.non-editable') && !selectedNode.classList.contains('editable')) {
                                            e.preventDefault(); // Block commands like typing or formatting
                                        }
                                    });

                                    // Prevent cursor placement or interaction outside of editable spans
                                    editor.on('MouseDown', (e) => {
                                        const targetNode = e.target;
                                        if (targetNode.closest('.non-editable') && !targetNode.classList.contains('editable')) {
                                            e.preventDefault(); // Prevent clicking into non-editable areas
                                            editor.selection.collapse(); // Remove selection
                                        }
                                    });

                                    // Ensure `editable` spans remain editable
                                    editor.on('BeforeSetContent', (e) => {
                                        const parser = new DOMParser();
                                        const doc = parser.parseFromString(e.content, 'text/html');
                                        const nonEditableElements = doc.querySelectorAll('.non-editable');
                                        nonEditableElements.forEach((el) => {
                                            // Set non-editable container to not allow interaction
                                            el.setAttribute('contenteditable', 'false');

                                            // Ensure editable spans inside remain editable
                                            el.querySelectorAll('.editable').forEach((span) => {
                                                span.setAttribute('contenteditable', 'true');
                                            });
                                        });
                                        e.content = doc.body.innerHTML;
                                    });

                                    // Adjust toolbar interaction based on selection
                                    editor.on('NodeChange', () => {
                                        const selectedNode = editor.selection.getNode();
                                        const inNonEditable = selectedNode.closest('.non-editable') && !selectedNode.classList.contains('editable');
                                        const toolbarButtons = editor.getContainer().querySelectorAll('.tox-tbtn');

                                        toolbarButtons.forEach((btn) => {
                                            btn.disabled = inNonEditable; // Disable buttons if in a non-editable area
                                        });
                                    });
                                    // Add Hanging Indent Button
                                    editor.ui.registry.addButton('addHangingIndent', {
                                        text: 'Hanging Indent',
                                        icon: 'indent',
                                        tooltip: 'Add Hanging Indent',
                                        onAction: () => {
                                            const selectedNode = editor.selection.getNode(); // Get the selected node
                                            const isParagraph = selectedNode.nodeName === 'P'; // Check if it's a <p> element

                                            if (isParagraph) {
                                                // Update the style directly for <p> elements
                                                selectedNode.style.textIndent = '-40px';
                                                selectedNode.style.marginLeft = '40px';
                                            } else {
                                                // Wrap in a <p> if not already a block element
                                                const content = editor.selection.getContent({ format: 'html' });
                                                editor.selection.setContent(
                                                    `<p style="text-indent: -40px; margin-left: 40px;">${content}</p>`
                                                );
                                            }
                                        },
                                    });

                                    // Remove Hanging Indent Button
                                    editor.ui.registry.addButton('removeHangingIndent', {
                                        text: 'Remove Hanging Indent',
                                        icon: 'outdent',
                                        tooltip: 'Remove Hanging Indent',
                                        onAction: () => {
                                            const selectedNode = editor.selection.getNode(); // Get the selected node
                                            const isParagraph = selectedNode.nodeName === 'P'; // Check if it's a <p> element

                                            if (isParagraph) {
                                                // Remove the hanging indent styles
                                                selectedNode.style.textIndent = '';
                                                selectedNode.style.marginLeft = '';
                                            } else {
                                                // Handle nested <p> tags (if any)
                                                const content = editor.selection.getContent({ format: 'html' });
                                                editor.selection.setContent(
                                                    content.replace(/<p[^>]*style=["'][^"']*text-indent:\s*-40px;?\s*margin-left:\s*40px;?[^"']*["'][^>]*>(.*?)<\/p>/g, '$1')
                                                );
                                            }
                                        },
                                    });
                                },
                            }}
                            onEditorChange={(content) => handleEditorChange(content, page.id)}
                        />
                    </div>
                ))) : (
                    <p>Loading editor...</p>
                )}
            </div>



            <div className="mt-4 flex gap-4">
                <button
                    onClick={handleSaveOrUpdateDocument}
                    className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
                >
                    {isUpdateMode ? 'Update Document' : 'Save Document'}
                </button>

                {/* Mini Message Box (Centered) */}
                {message && (
                    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                    p-4 rounded shadow-lg text-white text-center w-80"
                        style={{
                            backgroundColor: message.type === 'success' ? '#4CAF50'
                                : message.type === 'error' ? '#F44336'
                                    : '#FFC107'
                        }}>
                        {message.text}
                    </div>
                )}

                <button
                    onClick={() => navigate('/documents')}
                    className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-700"
                >
                    Cancel
                </button>
                <button
                    onClick={handlePrintDocument}
                    className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-700"
                >
                    Print Document
                </button>
            </div>
        </div>
    );
};

export default DocumentContainer;

// asdfasdfasdfasdfasdfasdfasdfasdfaasd