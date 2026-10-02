import { useEffect, useMemo, useState } from "preact/hooks";
import type { TargetedEvent } from "preact";
import { neonInsert, neonSelect, neonDelete, neonUpdate, getAuthHeaders } from "@/lib/neon";
import { RichTextEditor } from "@/components/RichTextEditor";
import { StorageImage } from "@/components/StorageImage";
import styles from "./admin.module.css";
import { auth } from "@/lib/neon";

export type Projects = {
    ID: string;
    Picture: string;
    Description: string;
    Title: string;
    Type: "Project" | "Work" | "Hobby" | "Education";
    Created: string;
};

type StorageFile = {
    name: string;
    id?: string | null;
    created_at?: string | null;
    metadata?: Record<string, unknown> | null;
};

const IMAGE_URL = import.meta.env.VITE_NEON_STORAGE_URL;

export default function Admin() {
    const [list, setList] = useState<Projects[]>([]);
    const [savingId, setSavingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [creatingType, setCreatingType] = useState<string | null>(null);
    const [general, setGeneral] = useState<Record<string, string>>({});
    const [savingGeneralLabel, setSavingGeneralLabel] = useState<string | null>(null);

    // Storage / Media state
    const [images, setImages] = useState<StorageFile[]>([]);
    const [loadingImages, setLoadingImages] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [deletingImageName, setDeletingImageName] = useState<string | null>(null);
    const [copiedPath, setCopiedPath] = useState<string | null>(null);

    useEffect(() => {
        getProjects();
        getGeneral();
        fetchImages();
    }, []);

    async function getProjects(): Promise<void> {
        try {
            const data = await neonSelect<Projects>("Projects");

            data.sort((a, b) => new Date(b.Created).getTime() - new Date(a.Created).getTime());

            setList(data);
        } catch (error) {
            console.error("Error fetching projects:", error);
        }
    }

    async function getGeneral(): Promise<void> {
        try {
            const data = await neonSelect<{
                Label: string;
                Text: string;
            }>("General");

            setGeneral(Object.fromEntries(data.map((item) => [item.Label, item.Text])));
        } catch (error) {
            console.error("Error fetching general settings:", error);
        }
    }

    async function fetchImages() {
        setLoadingImages(true);

        try {
            const response = await fetch(`${IMAGE_URL}/list`, {
                headers: await getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }

            const data: StorageFile[] = await response.json();

            setImages(data.filter((file) => file.name && !file.name.startsWith(".")));
        } catch (error) {
            console.error("Error fetching images:", error);
        } finally {
            setLoadingImages(false);
        }
    }

    async function handleUpload(e: TargetedEvent<HTMLInputElement, Event>) {
        const input = e.currentTarget;
        const files = input.files;

        if (!files || files.length === 0) {
            return;
        }

        setUploading(true);
        setUploadError(null);

        try {
            const headers = await getAuthHeaders();

            for (const file of files) {
                const sanitizedName = file.name.replace(/\s+/g, "-");

                const renamedFile = new File([file], sanitizedName, {
                    type: file.type,
                });

                const formData = new FormData();

                formData.append("file", renamedFile);

                const response = await fetch(`${IMAGE_URL}/upload`, {
                    method: "POST",
                    headers,
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error(await response.text());
                }
            }

            await fetchImages();
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);

            console.error("Upload error:", error);

            setUploadError(message);
        } finally {
            setUploading(false);
            input.value = "";
        }
    }

    async function handleDeleteImage(fileName: string) {
        if (!window.confirm(`Are you sure you want to delete "${fileName}" from storage?`)) {
            return;
        }

        setDeletingImageName(fileName);

        try {
            const response = await fetch(`${IMAGE_URL}/?key=${encodeURIComponent(fileName)}`, {
                method: "DELETE",
                headers: await getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }

            await fetchImages();
        } catch (error) {
            console.error("Delete image error:", error);

            alert(`Failed to delete image: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setDeletingImageName(null);
        }
    }

    function copyToClipboard(text: string) {
        navigator.clipboard.writeText(text);
        setCopiedPath(text);
        setTimeout(() => setCopiedPath(null), 2000);
    }

    const projects = useMemo(() => {
        return list.filter((item) => item.Type === "Project");
    }, [list]);

    const works = useMemo(() => {
        return list.filter((item) => item.Type === "Work");
    }, [list]);

    const hobbies = useMemo(() => {
        return list.filter((item) => item.Type === "Hobby");
    }, [list]);

    const educations = useMemo(() => {
        return list.filter((item) => item.Type === "Education").sort((a, b) => new Date(b.Created).getTime() - new Date(a.Created).getTime());
    }, [list]);

    function updateLocalProject(id: string, updates: Partial<Projects>) {
        setList((current) => current.map((project) => (project.ID === id ? { ...project, ...updates } : project)));
    }

    async function createItem(type: "Project" | "Work" | "Hobby" | "Education") {
        setCreatingType(type);

        const newItem: Projects = {
            ID: crypto.randomUUID(),
            Title: `New ${type}`,
            Picture: images.length > 0 ? images[0].name : "",
            Description: "",
            Type: type,
            Created: new Date().toISOString(),
        };

        try {
            await neonInsert<Projects>("Projects", newItem);

            setList((current) => [newItem, ...current]);
        } catch (error) {
            console.error("Error creating item:", error);

            alert(`Failed to create ${type}`);
        } finally {
            setCreatingType(null);
        }
    }

    async function deleteItem(id: string, title: string) {
        if (!window.confirm(`Are you sure you want to delete "${title || "Untitled"}"?`)) {
            return;
        }

        setDeletingId(id);

        try {
            await neonDelete("Projects", `ID=eq.${encodeURIComponent(id)}`);

            setList((current) => current.filter((item) => item.ID !== id));
        } catch (error) {
            console.error("Error deleting item:", error);

            alert("Failed to delete item");
        } finally {
            setDeletingId(null);
        }
    }

    async function saveProject(id: string, updates: Pick<Projects, "Title" | "Description" | "Picture">) {
        setSavingId(id);

        try {
            await neonUpdate<Projects>("Projects", `ID=eq.${encodeURIComponent(id)}`, updates);

            updateLocalProject(id, updates);
        } catch (error) {
            console.error("Error saving project:", error);

            alert("Failed to save");
        } finally {
            setSavingId(null);
        }
    }

    async function saveGeneral(label: string, markdown: string) {
        setSavingGeneralLabel(label);

        try {
            const data = await neonUpdate<{
                Label: string;
                Text: string;
            }>("General", `Label=eq.${encodeURIComponent(label)}`, {
                Text: markdown,
            });

            if (!data.length) {
                console.error(`No row updated for: ${label}`);
                return;
            }

            setGeneral((current) => ({
                ...current,
                [label]: markdown,
            }));
        } catch (error) {
            console.error(error);
            alert(`Failed to save ${label}`);
        } finally {
            setSavingGeneralLabel(null);
        }
    }

    function updateLocalGeneral(label: string, text: string) {
        setGeneral((current) => ({
            ...current,
            [label]: text,
        }));
    }

    async function handleLogout() {
        await auth.signOut();
        window.location.href = "/login";
    }

    // Render an item editor card (Project, Work, Hobby, Education)
    function renderItemCard(item: Projects) {
        return (
            <div key={item.ID} className={styles.projectCard}>
                <div className={styles.cardTopRow}>
                    <span className={styles.cardTypeBadge}>{item.Type}</span>
                    <button
                        className={`${styles.btn} ${styles.btnDangerOutline} ${styles.btnSmall}`}
                        onClick={() => deleteItem(item.ID, item.Title)}
                        disabled={deletingId === item.ID}
                    >
                        {deletingId === item.ID ? "Deleting..." : "🗑️ Delete"}
                    </button>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Title</label>
                    <input
                        className={styles.projectTitleInput}
                        type="text"
                        placeholder="Item Title"
                        value={item.Title}
                        onChange={(e) => updateLocalProject(item.ID, { Title: e.currentTarget.value })}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Image Reference & Preview</label>
                    <div className={styles.imageRefContainer}>
                        <div className={styles.imageInputs}>
                            <select
                                className={styles.imageSelectInput}
                                value={images.some((img) => img.name === item.Picture) ? item.Picture : ""}
                                onChange={(e) => {
                                    if (e.currentTarget.value) {
                                        updateLocalProject(item.ID, { Picture: e.currentTarget.value });
                                    }
                                }}
                            >
                                <option value="">-- Or choose from uploaded images --</option>
                                {images.map((img) => (
                                    <option key={img.name} value={img.name}>
                                        {img.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.imagePreviewBox}>
                            {item.Picture ? <StorageImage path={item.Picture} alt={item.Title} /> : <span style={{ color: "#888", fontSize: "0.8rem" }}>No image</span>}
                        </div>
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Description</label>
                    <RichTextEditor
                        value={item.Description || ""}
                        onChangeAction={(content) => {
                            updateLocalProject(item.ID, { Description: content });
                        }}
                        placeholder="Write project description..."
                    />
                </div>

                <div className={styles.cardFooter}>
                    <button
                        className={`${styles.btn} ${styles.btnPrimary}`}
                        onClick={() =>
                            saveProject(item.ID, {
                                Title: item.Title,
                                Description: item.Description,
                                Picture: item.Picture,
                            })
                        }
                        disabled={savingId === item.ID}
                    >
                        {savingId === item.ID ? "⏳ Saving..." : "💾 Save Changes"}
                    </button>
                    {savingId === item.ID && <span className={styles.statusMessage}>Saving changes...</span>}
                </div>
            </div>
        );
    }

    return (
        <div className={styles.adminContainer}>
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h1 className={styles.headerTitle}>Admin Dashboard</h1>
                    <p className={styles.sectionSubtitle}>Manage portfolio content, media assets, and categories</p>
                </div>
                <div className={styles.headerActions}>
                    <a href="/" className={`${styles.btn} ${styles.btnSecondary}`}>
                        👁️ View Portfolio
                    </a>
                    <button onClick={handleLogout} className={`${styles.btn} ${styles.btnSecondary}`}>
                        🔒 Log Out
                    </button>
                </div>
            </div>

            {/* Media Manager Section */}
            <section className={styles.mediaManager}>
                <div className={styles.sectionHeader} style={{ marginTop: 0 }}>
                    <div>
                        <h2 className={styles.sectionTitle}>🖼️ Media Assets Manager</h2>
                        <p className={styles.sectionSubtitle}>Upload, view, copy filename references, or delete images in storage (`portfolio-images`)</p>
                    </div>
                    <button className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSmall}`} onClick={fetchImages} disabled={loadingImages}>
                        🔄 {loadingImages ? "Refreshing..." : "Refresh"}
                    </button>
                </div>

                {uploadError && <div className={`${styles.alert} ${styles.alertError}`}>{uploadError}</div>}

                <div className={styles.mediaUploadRow}>
                    <label className={`${styles.btn} ${styles.btnPrimary} ${styles.uploadInputWrapper}`}>
                        {uploading ? "⏳ Uploading..." : "➕ Upload Image(s)"}
                        <input type="file" accept="image/*" multiple onChange={handleUpload} disabled={uploading} />
                    </label>
                    <span style={{ fontSize: "0.85rem", color: "#666" }}>
                        {images.length} image{images.length === 1 ? "" : "s"} stored
                    </span>
                </div>

                {loadingImages ? (
                    <p style={{ color: "#666", padding: "1rem" }}>Loading media files...</p>
                ) : images.length === 0 ? (
                    <p style={{ color: "#888", fontStyle: "italic", padding: "1rem" }}>No images found in storage. Upload one above!</p>
                ) : (
                    <div className={styles.mediaGrid}>
                        {images.map((img) => (
                            <div key={img.name} className={styles.mediaCard}>
                                <div className={styles.mediaThumbnailWrapper}>
                                    <StorageImage path={img.name} alt={img.name} className={styles.mediaThumbnail} />
                                </div>
                                <div className={styles.mediaName} title={img.name}>
                                    {img.name}
                                </div>
                                <div className={styles.mediaActions}>
                                    <button className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSmall}`} onClick={() => copyToClipboard(img.name)}>
                                        {copiedPath === img.name ? "✓ Copied" : "📋 Copy"}
                                    </button>
                                    <button
                                        className={`${styles.btn} ${styles.btnDangerOutline} ${styles.btnSmall}`}
                                        onClick={() => handleDeleteImage(img.name)}
                                        disabled={deletingImageName === img.name}
                                    >
                                        {deletingImageName === img.name ? "..." : "🗑️"}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* About Me Section */}
            <section>
                <div className={styles.sectionHeader}>
                    <div>
                        <h2 className={styles.sectionTitle}>👤 About Me</h2>
                        <p className={styles.sectionSubtitle}>Edit profile subtitle and about me narrative</p>
                    </div>
                </div>
                <div className={styles.projectCard}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Profile Subtitle</label>
                        <input
                            className={styles.projectTitleInput}
                            type="text"
                            value={general["Profile Subtitle"] ?? ""}
                            onChange={(e) => updateLocalGeneral("Profile Subtitle", e.currentTarget.value)}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>About Me Description</label>
                        <RichTextEditor
                            value={general["About Me Description"] ?? ""}
                            onChangeAction={(content) => updateLocalGeneral("About Me Description", content)}
                            placeholder="Write about me..."
                        />
                    </div>
                    <div className={styles.cardFooter}>
                        <button
                            className={`${styles.btn} ${styles.btnPrimary}`}
                            onClick={async () => {
                                await saveGeneral("About Me Description", general["About Me Description"] ?? "");
                                await saveGeneral("Profile Subtitle", general["Profile Subtitle"] ?? "");
                            }}
                            disabled={savingGeneralLabel !== null}
                        >
                            {savingGeneralLabel ? "⏳ Saving..." : "💾 Save About Me"}
                        </button>
                        {savingGeneralLabel && <span className={styles.statusMessage}>Saving About Me...</span>}
                    </div>
                </div>
            </section>

            {/* Projects Section */}
            <section>
                <div className={styles.sectionHeader}>
                    <div>
                        <h2 className={styles.sectionTitle}>🚀 Projects</h2>
                        <p className={styles.sectionSubtitle}>Showcase of software and engineering projects</p>
                    </div>
                    <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => createItem("Project")} disabled={creatingType === "Project"}>
                        {creatingType === "Project" ? "Creating..." : "➕ Add Project"}
                    </button>
                </div>
                <div>
                    {projects.length === 0 ? (
                        <div className={styles.emptySectionPrompt}>
                            <p>No projects found.</p>
                            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => createItem("Project")}>
                                ➕ Create First Project
                            </button>
                        </div>
                    ) : (
                        projects.map(renderItemCard)
                    )}
                </div>
            </section>

            {/* Work Experience Section */}
            <section>
                <div className={styles.sectionHeader}>
                    <div>
                        <h2 className={styles.sectionTitle}>💼 Work Experience</h2>
                        <p className={styles.sectionSubtitle}>Career history and professional roles</p>
                    </div>
                    <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => createItem("Work")} disabled={creatingType === "Work"}>
                        {creatingType === "Work" ? "Creating..." : "➕ Add Work Experience"}
                    </button>
                </div>
                <div>
                    {works.length === 0 ? (
                        <div className={styles.emptySectionPrompt}>
                            <p>No work experience found.</p>
                            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => createItem("Work")}>
                                ➕ Create First Work Entry
                            </button>
                        </div>
                    ) : (
                        works.map(renderItemCard)
                    )}
                </div>
            </section>

            {/* Hobbies Section */}
            <section>
                <div className={styles.sectionHeader}>
                    <div>
                        <h2 className={styles.sectionTitle}>🎯 Hobbies</h2>
                        <p className={styles.sectionSubtitle}>Personal interests and activities</p>
                    </div>
                    <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => createItem("Hobby")} disabled={creatingType === "Hobby"}>
                        {creatingType === "Hobby" ? "Creating..." : "➕ Add Hobby"}
                    </button>
                </div>
                <div>
                    {hobbies.length === 0 ? (
                        <div className={styles.emptySectionPrompt}>
                            <p>No hobbies found.</p>
                            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => createItem("Hobby")}>
                                ➕ Create First Hobby
                            </button>
                        </div>
                    ) : (
                        hobbies.map(renderItemCard)
                    )}
                </div>
            </section>

            {/* Education Section */}
            <section>
                <div className={styles.sectionHeader}>
                    <div>
                        <h2 className={styles.sectionTitle}>🎓 Education</h2>
                        <p className={styles.sectionSubtitle}>Academic qualifications and schooling (newest to oldest)</p>
                    </div>
                    <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => createItem("Education")} disabled={creatingType === "Education"}>
                        {creatingType === "Education" ? "Creating..." : "➕ Add Education"}
                    </button>
                </div>
                <div>
                    {educations.length === 0 ? (
                        <div className={styles.emptySectionPrompt}>
                            <p>No education entries found.</p>
                            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => createItem("Education")}>
                                ➕ Create First Education Entry
                            </button>
                        </div>
                    ) : (
                        educations.map(renderItemCard)
                    )}
                </div>
            </section>
        </div>
    );
}
