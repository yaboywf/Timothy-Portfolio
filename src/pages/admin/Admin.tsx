import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { MarkdownEditor } from "@/components/MarkdownEditor"
import styles from "./admin.module.css"

export type Projects = {
    ID: string,
    Picture: string,
    Description: string,
    Title: string
}

export default function Admin() {
    const [projects, setProjects] = useState<Projects[]>([]);
    const [savingId, setSavingId] = useState<string | null>(null)

    useEffect(() => {
        async function getProjects(): Promise<void> {
            const { data, error } = await supabase
                .from("Projects")
                .select("*")

            if (error) {
                console.log(error)
            } else {
                console.log(data)
                setProjects(data)
            }
        }

        getProjects()
    }, [])

    function updateLocalProject(id: string, updates: Partial<Projects>) {
        setProjects((current) =>
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


    return (
        <div className={styles.adminContainer}>
            <h1>Admin</h1>

            {/* <h2>About Me</h2>
            <div className={styles.markdownWrapper}>
                <MarkdownEditor
                    initialValue={aboutMe}
                    onSave={(markdown) => saveAboutMe(markdown)}
                />
            </div> */}

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
        </div>
    )
}