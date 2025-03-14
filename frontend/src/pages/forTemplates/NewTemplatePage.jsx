import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import ListItem from '@tiptap/extension-list-item'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline';

import Toolbar from './Toolbar';

import './templates.css'

export default function NewTemplatePage() {
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
    content: '',
  });  

  return (
    <div className="editor">
      {editor && <Toolbar editor={editor} />}
      <EditorContent className="editor__content" editor={editor} />
    </div>
  );
}