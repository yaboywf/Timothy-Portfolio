import styles from "./richTextEditor.module.css"

type RichTextContentProps = {
    html?: string | null
    className?: string
}

export function RichTextContent({ html, className = "" }: RichTextContentProps) {
    return (
        <div
            className={`${styles.editor_content} ${className}`.trim()}
            dangerouslySetInnerHTML={{
                __html: html ?? "",
            }}
        />
    )
}