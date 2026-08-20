import MDEditor from "@uiw/react-md-editor"

type Props = {
    value?: string
    onChange: (value: string) => void
    height?: number
}

export function MarkdownEditor({
    value = "",
    onChange,
    height = 280,
}: Props) {
    return (
        <div data-color-mode="light">
            <MDEditor
                value={value}
                onChange={(val) => onChange(val ?? "")}
                height={height}
            />
        </div>
    )
}