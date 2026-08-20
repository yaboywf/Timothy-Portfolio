import { useEffect, useState } from "react"

import MDEditor from "@uiw/react-md-editor"

type Props = {
    initialValue?: string
    onSave: (markdown: string) => Promise<void>
}

export function MarkdownEditor({
    initialValue = "",
    onSave,
}: Props) {
    const [markdown, setMarkdown] = useState(initialValue)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        setMarkdown(initialValue)
    }, [initialValue])

    async function handleSave() {
        setSaving(true)

        try {
            await onSave(markdown)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div data-color-mode="light">
            <MDEditor
                value={markdown}
                onChange={(value) => setMarkdown(value ?? "")}
                height={280}
            />

            <button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save"}
            </button>
        </div>
    )
}