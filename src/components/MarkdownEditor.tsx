import { useState } from "react"
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

    async function handleSave() {
        setSaving(true)
        await onSave(markdown)
        setSaving(false)
    }

    return (
        <div data-color-mode="light">
            <MDEditor
                value={markdown}
                onChange={(value) => setMarkdown(value ?? "")}
                height={280}
                commandsFilter={(command) => {
                    if (command.name === "image" || command.name === "fullscreen") {
                        return false
                    }

                    return command
                }}
            />

            <button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save"}
            </button>
        </div>
    )
}