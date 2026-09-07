"use client"

import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import { FontSize, TextStyle, FontFamily } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import styles from "./richTextEditor.module.css"
import { useEffect, useRef, useState } from "preact/hooks";

type Props = {
    value: string;
    onChangeAction?: (html: string) => void;
    onChange?: (html: string) => void;
    readOnly?: boolean;
    placeholder?: string;
    className?: string;
};

export function RichTextEditor({ value, onChangeAction, onChange, readOnly = false, placeholder = "Placeholder", className = "" }: Props) {
    const elementRef = useRef<HTMLDivElement>(null);
    const onChangeRef = useRef(onChangeAction || onChange);
    const [editor, setEditor] = useState<Editor | null>(null);
    const [, refreshToolbar] = useState(0);

    useEffect(() => {
        onChangeRef.current = onChangeAction || onChange;
    }, [onChangeAction, onChange]);

    useEffect(() => {
        if (!elementRef.current) return;

        const instance = new Editor({
            element: elementRef.current,
            editable: !readOnly,

            extensions: [
                StarterKit.configure({
                    link: {
                        openOnClick: false,
                    },
                }),

                Placeholder.configure({ placeholder }),

                TextStyle,
                FontSize,
                FontFamily,
                Color,

                TextAlign.configure({
                    types: ["heading", "paragraph"],
                }),

                Superscript,
                Subscript,
            ],

            content: value,

            onUpdate: ({ editor }) => {
                onChangeRef.current?.(
                    editor.getHTML(),
                );
            },

            onTransaction: () => {
                refreshToolbar(
                    (current) => current + 1,
                );
            },
        });

        setEditor(instance);

        return () => {
            instance.destroy();
            setEditor(null);
        };
    }, [placeholder]);

    useEffect(() => {
        if (!editor) return;

        const nextValue = value || "";

        if (editor.getHTML() !== nextValue) {
            editor.commands.setContent(nextValue, {
                emitUpdate: false,
            });
        }
    }, [editor, value]);

    useEffect(() => {
        editor?.setEditable(!readOnly);
    }, [editor, readOnly]);

    if (!editor) {
        return (
            <div className={`${styles.editor}${className ? ` ${className}` : ""}`}>
                <div
                    key="editor-content"
                    ref={elementRef}
                    className={styles.editor_content}
                />
            </div>
        );
    }

    const editorState = {
        fontFamily:
            editor.getAttributes("textStyle")
                .fontFamily ?? "",

        fontSize:
            editor.getAttributes("textStyle")
                .fontSize ?? "",

        isList:
            editor.isActive("bulletList") ||
            editor.isActive("orderedList"),
    };

    const addLink = () => {
        const url = window.prompt("Enter link URL");

        if (!url) return;

        editor
            .chain()
            .focus()
            .setLink({ href: url })
            .run();
    };

    return (
        <div className={`${styles.editor}${className ? ` ${className}` : ""}`}>
            {!readOnly && <div key="editor-toolbar" className={styles.toolbar}>
                <div className={styles.container}>
                    <i className="fa-regular fa-heading"></i>
                    <select
                        value={
                            editor.isActive("heading", { level: 1 }) ? "h1" :
                                editor.isActive("heading", { level: 2 }) ? "h2" :
                                    editor.isActive("heading", { level: 3 }) ? "h3" :
                                        "paragraph"
                        }
                        onChange={(event) => {
                            const value = event.currentTarget.value;

                            const command = editor.chain().focus();

                            if (value === "paragraph") {
                                command.setParagraph().run();
                                return;
                            }

                            command.toggleHeading({
                                level: Number(value.slice(1)) as 1 | 2 | 3,
                            }).run();
                        }}
                    >
                        <option value="paragraph">Normal text</option>
                        <option value="h1">Heading 1</option>
                        <option value="h2">Heading 2</option>
                        <option value="h3">Heading 3</option>
                    </select>
                </div>

                <div className={styles.container}>
                    <i className="fa-regular fa-font"></i>
                    <select
                        value={editorState?.fontFamily}
                        onChange={(event) =>
                            editor
                                .chain()
                                .focus()
                                .setFontFamily(event.currentTarget.value)
                                .run()
                        }
                    >
                        <option value="" hidden>Font family</option>
                        <option value="'Geist', sans-serif">Geist</option>
                        <option value="Arial, sans-serif">Arial</option>
                        <option value="Georgia, serif">Georgia</option>
                        <option value="'Times New Roman', serif">Times New Roman</option>
                        <option value="'Courier New', monospace">Courier New</option>
                    </select>
                </div>

                <div className={styles.container}>
                    <i className="fa-regular fa-text-size"></i>
                    <select
                        value={editorState?.fontSize}
                        onChange={(event) =>
                            editor
                                .chain()
                                .focus()
                                .setFontSize(event.currentTarget.value)
                                .run()
                        }
                    >
                        <option value="">Font size</option>
                        <option value="12px">12 px</option>
                        <option value="14px">14 px</option>
                        <option value="16px">16 px</option>
                        <option value="18px">18 px</option>
                        <option value="20px">20 px</option>
                    </select>
                </div>

                <button
                    type="button"
                    className={editor.isActive("bold") ? "active" : ""}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                >
                    <i className="fa-regular fa-bold"></i>
                </button>

                <button
                    type="button"
                    className={editor.isActive("italic") ? "active" : ""}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                >
                    <i className="fa-regular fa-italic"></i>
                </button>

                <button
                    type="button"
                    className={editor.isActive("underline") ? "active" : ""}
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                >
                    <i className="fa-regular fa-underline"></i>
                </button>

                <button
                    type="button"
                    className={editor.isActive("strike") ? "active" : ""}
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                >
                    <i className="fa-regular fa-strikethrough"></i>
                </button>

                <button
                    type="button"
                    className={editor.isActive("superscript") ? "active" : ""}
                    onClick={() => editor.chain().focus().toggleSuperscript().run()}
                >
                    <i className="fa-regular fa-superscript"></i>
                </button>

                <button
                    type="button"
                    className={editor.isActive("subscript") ? "active" : ""}
                    onClick={() => editor.chain().focus().toggleSubscript().run()}
                >
                    <i className="fa-regular fa-subscript"></i>
                </button>

                <button
                    type="button"
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                >
                    <i className="fa-regular fa-horizontal-line" />
                </button>

                <button
                    type="button"
                    className={editor.isActive("blockquote") ? "active" : ""}
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                >
                    <i className="fa-solid fa-quote-left" />
                </button>

                <div className={styles.divider}></div>

                <input
                    className={styles.color_picker}
                    type="color"
                    aria-label="Text colour"
                    onChange={(event) =>
                        editor.chain().focus().setColor(event.currentTarget.value).run()
                    }
                />

                <div className={styles.divider}></div>

                <button type="button" onClick={addLink}>
                    <i className="fa-regular fa-link"></i>
                </button>

                <button
                    type="button"
                    onClick={() => editor.chain().focus().unsetLink().run()}
                >
                    <i className="fa-regular fa-link-slash"></i>
                </button>

                <div className={styles.divider} />

                <button
                    type="button"
                    className={editor.isActive("bulletList") ? "active" : ""}
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                >
                    <i className="fa-regular fa-list-ul" />
                </button>

                <button
                    type="button"
                    className={editor.isActive("orderedList") ? "active" : ""}
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                >
                    <i className="fa-regular fa-list-ol" />
                </button>

                {editorState?.isList && (
                    <>
                        <button
                            type="button"
                            onClick={() => editor.chain().focus().sinkListItem("listItem").run()}
                        >
                            <i className="fa-regular fa-indent" />
                        </button>

                        <button
                            type="button"
                            onClick={() => editor.chain().focus().liftListItem("listItem").run()}
                        >
                            <i className="fa-regular fa-outdent" />
                        </button>
                    </>
                )}

                <div className={styles.divider} />

                <button
                    type="button"
                    className={editor.isActive({ textAlign: "left" }) ? "active" : ""}
                    onClick={() => editor.chain().focus().setTextAlign("left").run()}
                >
                    <i className="fa-regular fa-align-left"></i>
                </button>

                <button
                    type="button"
                    className={editor.isActive({ textAlign: "center" }) ? "active" : ""}
                    onClick={() => editor.chain().focus().setTextAlign("center").run()}
                >
                    <i className="fa-regular fa-align-center"></i>
                </button>

                <button
                    type="button"
                    className={editor.isActive({ textAlign: "right" }) ? "active" : ""}
                    onClick={() => editor.chain().focus().setTextAlign("right").run()}
                >
                    <i className="fa-regular fa-align-right"></i>
                </button>

                <div className={styles.divider}></div>

                <button
                    type="button"
                    onClick={() => editor.chain().focus().undo().run()}
                >
                    <i className="fa-regular fa-arrow-rotate-left"></i>
                </button>

                <button
                    type="button"
                    onClick={() => editor.chain().focus().redo().run()}
                >
                    <i className="fa-regular fa-arrow-rotate-right"></i>
                </button>
            </div>}

            <div key="editor-content" ref={elementRef} className={styles.editor_content} data-readonly={readOnly} />
        </div>
    );
}