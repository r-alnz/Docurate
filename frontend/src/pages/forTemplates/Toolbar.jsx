import { Fragment } from 'react';
import { Bold, Italic, Strikethrough, Underline, Heading1, Heading2, List, ListOrdered, Quote, AlignLeft, AlignCenter, AlignRight, AlignJustify, Undo, Redo } from 'lucide-react';

const Toolbar = ({ editor }) => {
  if (!editor) return null;

  const items = [

    // ------- Basic

    { icon: Bold, title: 'Bold', action: () => editor.chain().focus().toggleBold().run(), isActive: () => editor.isActive('bold') },
    { icon: Italic, title: 'Italic', action: () => editor.chain().focus().toggleItalic().run(), isActive: () => editor.isActive('italic') },
    { icon: Strikethrough, title: 'Strike', action: () => editor.chain().focus().toggleStrike().run(), isActive: () => editor.isActive('strike') },
    { 
      icon: Underline, 
      title: 'Underline', 
      action: () => editor.chain().focus().toggleUnderline().run(), 
      isActive: () => editor.isActive('underline') 
    },    
    
    { type: 'divider' },

    // ------- Sizings

    // { icon: Heading1, title: 'Heading 1', action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), isActive: () => editor.isActive('heading', { level: 1 }) },
    // { icon: Heading2, title: 'Heading 2', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), isActive: () => editor.isActive('heading', { level: 2 }) },

    // ------- Lists

    { icon: List,
      title: 'Bullet List',
      action: () => {
        if (editor.isActive('bulletList')) {
          editor.chain().focus().clearNodes().run(); // Convert to paragraph
        } else {
          editor.chain().focus().toggleBulletList().run();
        }
      },
      isActive: () => editor.isActive('bulletList')
    },

    { icon: ListOrdered,
      title: 'Ordered List',
      action: () => {
        if (editor.isActive('orderedList')) {
          editor.chain().focus().clearNodes().run(); // Convert to paragraph
        } else {
          editor.chain().focus().toggleOrderedList().run();
        }
      },
      isActive: () => editor.isActive('orderedList')
    },
    
    { type: 'divider' },

    // { icon: Quote, title: 'Blockquote', action: () => editor.chain().focus().toggleBlockquote().run(), isActive: () => editor.isActive('blockquote') },

    // ------- Alignment

    { icon: AlignLeft,
      title: 'Align Left',
      action: () => editor.chain().focus().setTextAlign('left').run(),
      isActive: () => editor.getAttributes('paragraph').textAlign === 'left'
    },
    { icon: AlignCenter,
      title: 'Align Center',
      action: () => editor.chain().focus().setTextAlign('center').run(),
      isActive: () => editor.getAttributes('paragraph').textAlign === 'center'
    },
    { icon: AlignRight,
      title: 'Align Right',
      action: () => editor.chain().focus().setTextAlign('right').run(),
      isActive: () => editor.getAttributes('paragraph').textAlign === 'right'
    },
    { icon: AlignJustify,
      title: 'Justify',
      action: () => editor.chain().focus().setTextAlign('justify').run(),
      isActive: () => editor.getAttributes('paragraph').textAlign === 'justify'
    },

    { type: 'divider' },

    // -------

    { icon: Undo, title: 'Undo', action: () => editor.chain().focus().undo().run() },
    { icon: Redo, title: 'Redo', action: () => editor.chain().focus().redo().run() },
  ];

  return (
    <div className="flex space-x-2 mb-4">
      {items.map((item, index) => (
        <Fragment key={index}>
          {item.type === 'divider' ? (
            <div className="border-l border-gray-300 h-6 mx-2" />
          ) : (
            <button
              onClick={item.action}
              className={`px-3 py-1 border rounded-md ${item.isActive?.() ? 'bg-gray-300' : ''}`}
              title={item.title}
            >
              <item.icon className="w-5 h-5" />
            </button>
          )}
        </Fragment>
      ))}
    </div>
  );
};

export default Toolbar;
