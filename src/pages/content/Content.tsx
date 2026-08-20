import { SignedImage } from "@/components/SignedImage";
import styles from "./content.module.css"
import BlurText from "@/components/TextEffect";
import CardSwap, { Card } from "@/components/CardSwap";
import TiltedCard from "@/components/TiltedCard";
import { useEffect, useMemo, useState } from "react";
import { type Projects } from "../admin/Admin";
import { supabase } from "@/lib/supabase";
import MDEditor from "@uiw/react-md-editor"

export default function Introduction() {
	const [list, setList] = useState<Projects[]>([])
	const [general, setGeneral] = useState<Record<string, string>>({});

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

	const work = useMemo(() => {
		return list.filter(item => item.Type === "Work")
	}, [list])

	const hobbies = useMemo(() => {
		return list.filter(item => item.Type === "Hobby")
	}, [list])

	const educations = useMemo(() => {
		return list.filter(item => item.Type === "Education").sort((a, b) => new Date(b.Created).getTime() - new Date(a.Created).getTime())
	}, [list])

	return (
		<>
			<div className={styles.introduction}>
				<div className={styles.image_container}>
					<SignedImage path="Profile.webp" alt="Profile" className={styles.image} />
				</div>
				<div className={styles.container}>
					<BlurText text="Hello!" className={styles.subtitle} />
					<BlurText text="I'm Timothy Ho" className={styles.title} />
					<p data-color-mode="light"><MDEditor.Markdown source={general["Profile Subtitle"]} /></p>

					<div className={styles.media_container}>
						<i className="fa-brands fa-whatsapp" onClick={() => window.open("https://api.whatsapp.com/send?phone=6588019782")}></i>
						<i className="fa-brands fa-instagram" onClick={() => window.open("https://www.instagram.com/timx.hx")}></i>
						<i className="fa-regular fa-envelope" onClick={() => window.open("mailto:timmy.yyxx@gmail.com")}></i>
						<i className="fa-brands fa-linkedin" onClick={() => window.open("https://www.linkedin.com/in/timothyyhoo")}></i>
					</div>
					<button className={styles.resume_button}>
						<a href="/Timothy-CV.pdf" download="Timothy-CV.pdf">Download Resume</a>
					</button>
				</div>
			</div>

			<div className={styles.about_me}>
				<h2 className={styles.title}>About Me</h2>
				<SignedImage path="Introduction.webp" alt="Introduction" className={styles.image} />
				<article data-color-mode="light">
					<MDEditor.Markdown source={general["About Me Description"]} />
				</article>
			</div>

			<div className={styles.card_container}>
				<p className={styles.title}>What I've been up to</p>
				<p className={styles.subtitle}>A few things I’ve built, explored, and improved along the way.</p>
				<CardSwap
					cardDistance={60}
					verticalDistance={70}
					delay={10000}
					pauseOnHover={false}
				>
					{projects.map(project => (
						<Card className={styles.card}>
							<h3>{project.Title}</h3>
							<div data-color-mode="light">
								<SignedImage path={project.Picture} alt={project.Title} className={styles.image} />
								<MDEditor.Markdown source={project.Description} />
							</div>
						</Card>
					))}
				</CardSwap>
			</div>

			<div className={styles.education_main}>
				<div className={styles.education_title}>
					<h2>Education in Motion</h2>
					<p>The foundations, projects, and experiences shaping how I approach engineering.</p>
				</div>

				<div className={styles.education_container}>
					{educations.map(education => (
						<div className={styles.card} key={education.Title}>
							<div className={styles.left}>
								<SignedImage path={education.Picture} alt={education.Title} className={styles.image} />
								<div className={styles.line}></div>
							</div>
							<div>
								<h2>{education.Title}</h2>
								<p data-color-mode="light"><MDEditor.Markdown source={education.Description} /></p>
							</div>
						</div>
					))}
				</div>
			</div>

			<div className={`${styles.hobbies_container} ${styles.work_container}`}>
				<h2>Work Also Matters!</h2>

				{work.map(experience => <>
					<TiltedCard
						imageSrc={experience.Picture}
						isSignedImage={true}
						overlayContent={
							<div className={styles.overlay}>
								<h1>{experience.Title}</h1>
							</div>
						}
						captionText={experience.Title}
					/>

					<p data-color-mode="light">
						<MDEditor.Markdown source={experience.Description} />
					</p>
				</>)}
			</div>

			<div className={styles.hobbies_container}>
				<h2>Not Just Work</h2>
				
				{hobbies.map(hobby =>
					<TiltedCard
						key={hobby.ID}
						imageSrc={hobby.Picture}
						isSignedImage={true}
						overlayContent={
							<div className={styles.overlay}>
								<h1>{hobby.Title}</h1>
							</div>
						}
						captionText={hobby.Title}
					/>
				)}

				{hobbies.map(hobby => <p className={styles.f1_text1} key={hobby.Title} data-color-mode="light">
					<MDEditor.Markdown source={hobby.Description} />
				</p>)}
			</div>

			<p className={styles.footer}>Project made with ❤️ by <a href="https://dylanyeowf.pages.dev">Dylan</a></p>
		</>
	);
}