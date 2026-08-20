import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabase"
import { MarkdownEditor } from "@/components/MarkdownEditor"
import styles from "./admin.module.css"

export type Projects = {
    ID: string,
    Picture: string,
    Description: string,
    Title: string
    Type: "Project" | "Work" | "Hobby" | "Education"
    Created: string
}

export default function Admin() {
    const [list, setList] = useState<Projects[]>([]);
    const [savingId, setSavingId] = useState<string | null>(null)
    const [general, setGeneral] = useState<Record<string, string>>({})
    const [savingGeneralLabel, setSavingGeneralLabel] = useState<string | null>(
        null
    )

    useEffect(() => {
        async function getProjects(): Promise<void> {
            const { data, error } = await supabase
                .from("Projects")
                .select("*")

            if (error) {
                console.log(error)
            } else {
                console.log(data)
                setList(data)
            }
        }

        async function getGeneral(): Promise<void> {
            const { data, error } = await supabase
                .from("General")
                .select("Label, Text")

            if (error) {
                console.error(error)
                return
            }

            setGeneral(
                Object.fromEntries(
                    (data ?? []).map((item) => [item.Label, item.Text])
                )
            )
        }

        getProjects()
        getGeneral()
    }, [])

    const projects = useMemo(() => {
        return list.filter(item => item.Type === "Project")
    }, [list])

    const works = useMemo(() => {
        return list.filter(item => item.Type === "Work")
    }, [list])

    const hobbies = useMemo(() => {
        return list.filter(item => item.Type === "Hobby")
    }, [list])

    const educations = useMemo(() => {
        return list.filter(item => item.Type === "Education").sort((a, b) => new Date(b.Created).getTime() - new Date(a.Created).getTime())
    }, [list])

    function updateLocalProject(id: string, updates: Partial<Projects>) {
        setList((current) =>
            current.map((project) =>
                project.ID === id ? { ...project, ...updates } : project
            )
        )
    }

    async function saveProject(
        id: string,
        updates: Pick<Projects, "Title" | "Description">
    ) {
        setSavingId(id)

        const { error } = await supabase
            .from("Projects")
            .update(updates)
            .eq("ID", id)

        setSavingId(null)

        if (error) {
            console.error(error)
            return
        }

        updateLocalProject(id, updates)
    }

    async function saveGeneral(label: string, markdown: string) {
        setSavingGeneralLabel(label)

        const { data, error } = await supabase
            .from("General")
            .update({ Text: markdown })
            .eq("Label", label)
            .select("Label, Text")

        setSavingGeneralLabel(null)

        if (error) {
            console.error(error)
            return
        }

        if (!data?.length) {
            console.error(`No row updated for: ${label}`)
            return
        }

        setGeneral((current) => ({
            ...current,
            [label]: markdown,
        }))
    }

    function updateLocalGeneral(label: string, text: string) {
        setGeneral((current) => ({
            ...current,
            [label]: text,
        }))
    }

    return (
        <div className={styles.adminContainer}>
            <h1>Admin</h1>

            <h2>About Me</h2>
            <div className={styles.projectCard}>
                <input className={styles.projectTitleInput} type="text" value={general["Profile Subtitle"]} onChange={(e) => updateLocalGeneral("Profile Subtitle", e.target.value)}  />
                <div className={styles.markdownWrapper}>
                    <MarkdownEditor
                        initialValue={general["About Me Description"]}
                        onSave={async (markdown) => {
                            await saveGeneral("About Me Description", markdown);
                            await saveGeneral("Profile Subtitle", general["Profile Subtitle"])
                        }}
                    />
                </div>
                {savingGeneralLabel === "About Me Description" && <p>Saving...</p>}
            </div>

            <h2 className={styles.sectionTitle}>Projects</h2>
            <div>
                {projects.length === 0 ? (
                    <p>No projects found.</p>
                ) : (
                    projects.map((project) => (
                        <div key={project.ID} className={styles.projectCard}>
                            <input className={styles.projectTitleInput} type="text" value={project.Title} onChange={(e) => updateLocalProject(project.ID, { Title: e.target.value })}  />
                            <div className={styles.markdownWrapper}>
                                <MarkdownEditor
                                    initialValue={project.Description}
                                    onSave={(markdown) => saveProject(project.ID, { Title: project.Title, Description: markdown })}
                                />
                            </div>
                            {savingId === project.ID && <p>Saving...</p>}
                        </div>
                    ))
                )}
            </div>

            <h2>Work Experience</h2>
            <div>
                {works.length === 0 ? (
                    <p>No work experience found.</p>
                ) : (
                    works.map((work) => (
                        <div key={work.ID} className={styles.projectCard}>
                            <input className={styles.projectTitleInput} type="text" value={work.Title} onChange={(e) => updateLocalProject(work.ID, { Title: e.target.value })}  />
                            <div className={styles.markdownWrapper}>
                                <MarkdownEditor
                                    initialValue={work.Description}
                                    onSave={(markdown) => saveProject(work.ID, { Title: work.Title, Description: markdown })}
                                />
                            </div>
                            {savingId === work.ID && <p>Saving...</p>}
                        </div>
                    ))
                )}
            </div>

            <h2>Hobbies</h2>
            <div>
                {hobbies.length === 0 ? (
                    <p>No hobbies found.</p>
                ) : (
                    hobbies.map((hobby) => (
                        <div key={hobby.ID} className={styles.projectCard}>
                            <input className={styles.projectTitleInput} type="text" value={hobby.Title} onChange={(e) => updateLocalProject(hobby.ID, { Title: e.target.value })}  />
                            <div className={styles.markdownWrapper}>
                                <MarkdownEditor
                                    initialValue={hobby.Description}
                                    onSave={(markdown) => saveProject(hobby.ID, { Title: hobby.Title, Description: markdown })}
                                />
                            </div>
                            {savingId === hobby.ID && <p>Saving...</p>}
                        </div>
                    ))
                )}
            </div>

            <h2>Education (from newest to oldest)</h2>
            <div>
                {educations.length === 0 ? (
                    <p>No education found.</p>
                ) : (
                    educations.map((education) => (
                        <div key={education.ID} className={styles.projectCard}>
                            <input className={styles.projectTitleInput} type="text" value={education.Title} onChange={(e) => updateLocalProject(education.ID, { Title: e.target.value })}  />
                            <div className={styles.markdownWrapper}>
                                <MarkdownEditor
                                    initialValue={education.Description}
                                    onSave={(markdown) => saveProject(education.ID, { Title: education.Title, Description: markdown })}
                                />
                            </div>
                            {savingId === education.ID && <p>Saving...</p>}
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}