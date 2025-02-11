import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Editor } from '@tinymce/tinymce-react';
import { getToken } from '../utils/authUtil.js';
import { getTemplateById } from '../services/templateService.js';

const ViewTemplateContainer = () => {
    const { id } = useParams(); // Fetch ID from the URL if available
    const [pages, setPages] = useState([{ id: 1, content: '' }]);
    const [currentPage, setCurrentPage] = useState(1);
    const [documentName, setDocumentName] = useState('');
    const [documentType, setDocumentType] = useState('');
    const [documentSubtype, setDocumentSubtype] = useState('');
    const [requiredRole, setRequiredRole] = useState('student');
    const [paperSize, setPaperSize] = useState('letter');
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [margins, setMargins] = useState({ top: 1, right: 1, bottom: 1, left: 1 });
    
    const DPI = 96; // Fixed DPI for page dimensions
    const pageSizes = {
        letter: { width: DPI * 8.5, height: DPI * 11 },
        legal: { width: DPI * 8.5, height: DPI * 14 },
        a4: { width: DPI * 8.27, height: DPI * 11.69 },
    };

    const selectedPageSize = pageSizes[paperSize];

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
        max-height: ${DPI - DPI/3}px;
        position: relative; /* Ensure it doesn't interfere with other content flow */
        margin: -${margins.top}in -${margins.right}in 0 -${margins.left}in;
        overflow: hidden; /* Ensure no content spills over */
    }

    .footer {
        margin: -0.70in -0.70in; /* Adjust for the footer */
    }

    .header img, .footer img {
        width: 100%;
        height: auto;
        display: block;
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



    .page, .mce-content-body {
        position: relative;
        width: ${selectedPageSize.width / DPI}in;
        min-height: ${(selectedPageSize.height / DPI) + 1}in;
        max-height: ${(selectedPageSize.height / DPI) + 1}in;
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
    }
`;

    useEffect(() => {
        if (id) {
            const loadTemplate = async () => {
                try {
                    const token = getToken();
                    const templateData = await getTemplateById(id, token);

                    setDocumentName(templateData.name);
                    setDocumentType(templateData.type);
                    setDocumentSubtype(templateData.subtype || '');
                    setRequiredRole(templateData.requiredRole);
                    setPaperSize(templateData.paperSize);

                    if (templateData?.margins) { // Check if margins exist
                        console.log(1);
                        const { top, bottom, left, right } = templateData.margins;
                        setMargins({
                            top:top ,
                            bottom: bottom,
                            left: left ,
                            right: right,
                        });
                    }

                    setPages(
                        templateData.content.split('<hr style="page-break-after: always;">').map((content, index) => ({
                            id: index + 1,
                            content,
                        }))
                    );

                    setIsDataLoaded(true);
                } catch (error) {
                    console.error('Error loading template:', error.message);
                    alert('Failed to load template. Please try again.');
                }
            };
            loadTemplate();
        }
    }, [id]);

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

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">{documentName}</h1>
            <div className="mb-4 border p-4 rounded shadow">
                <h2 className="text-xl font-medium mb-4">Template Information</h2>
                <p className="mb-2">
                    <strong>Type:</strong> {documentType}
                </p>
                <p className="mb-2">
                    <strong>Subtype:</strong> {documentSubtype || 'N/A'}
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
                    onClick={handlePreviousPage}
                    className="bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 disabled:opacity-50"
                >
                    Previous
                </button>
                <span>
                    Page {currentPage} of {pages.length}
                </span>
                <button
                    disabled={currentPage === pages.length}
                    onClick={handleNextPage}
                    className="bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 disabled:opacity-50"
                >
                    Next
                </button>
            </div>

            {/* Editor */}
            {isDataLoaded ? pages.map((page) => (
                <div key={page.id} style={{ display: currentPage === page.id ? 'block' : 'none' }}>
                    <Editor
                        apiKey="nlhi2d7e29jjlh8lggzbzvaee9h7u3ba4hfywmh0v1skgixg"
                        value={page.content}
                        init={{
                            height: selectedPageSize.height,
                            menubar: false,
                            toolbar: false,
                            readonly: true,
                            content_style: sharedStyles,
                        }}
                    />
                </div>
            )): (
                <p>Loading editor...</p>
            )}
        </div>
    );
};

export default ViewTemplateContainer;
