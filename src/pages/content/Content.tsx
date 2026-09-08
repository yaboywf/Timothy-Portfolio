import { StorageImage } from "@/components/StorageImage";
import styles from "./content.module.css"
import BlurText from "@/components/TextEffect";
import CardSwap, { Card } from "@/components/CardSwap";
import TiltedCard from "@/components/TiltedCard";
import { useEffect, useMemo, useState } from "preact/hooks";
import { type Projects } from "../admin/Admin";
import { supabase } from "@/lib/supabase";
import { RichTextContent } from "@/components/RichTextContent";

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
		<main>
			<div className={styles.introduction}>
				<div className={styles.image_container}>
					<StorageImage path="Profile.webp" alt="Profile" className={styles.image} loading="eager" fetchPriority="high" />
				</div>
				<div className={styles.container}>
					<BlurText text="Hello!" className={styles.subtitle} />
					<BlurText text="I'm Timothy Ho" className={styles.title} />
					<div data-color-mode="light">
						<RichTextContent html={general["Profile Subtitle"] ?? ""} />
					</div>

					<div className={styles.media_container}>
						<a href="https://api.whatsapp.com/send?phone=6588019782" target="_blank" rel="noopener noreferrer">
							<i className="fa-brands fa-whatsapp" aria-label="Open WhatsApp"></i>
						</a>
						<a href="https://www.instagram.com/timx.hx" target="_blank" rel="noopener noreferrer">
							<i className="fa-brands fa-instagram" aria-label="Open Instagram"></i>
						</a>
						<a href="mailto:timmy.yyxx@gmail.com" target="_blank" rel="noopener noreferrer">
							<i className="fa-regular fa-envelope" aria-label="Send Email"></i>
						</a>
						<a href="https://www.linkedin.com/in/timothyyhoo" target="_blank" rel="noopener noreferrer">
							<i className="fa-brands fa-linkedin" aria-label="Open LinkedIn"></i>
						</a>
					</div>
					<button className={styles.resume_button}>
						<a href="/Timothy-CV.pdf" download="Timothy-CV.pdf">Download Resume</a>
					</button>
				</div>
			</div>

			<div className={styles.about_me}>
				<h2 className={styles.title}>About Me</h2>
				<StorageImage path="Introduction.webp" alt="Introduction" className={styles.image} loading="lazy" />
				<article data-color-mode="light">
					<RichTextContent html={general["About Me Description"] ?? ""} />
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
								<StorageImage path={project.Picture} alt={project.Title} className={styles.image} loading="lazy" />
								<RichTextContent html={project.Description} />
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
								<StorageImage path={education.Picture} alt={education.Title} className={styles.image} loading="lazy" />
								<div className={styles.line}></div>
							</div>
							<div>
								<h2>{education.Title}</h2>
								<div data-color-mode="light">
									<RichTextContent html={education.Description} />
								</div>
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
						overlayContent={
							<div className={styles.overlay}>
								<h1>{experience.Title}</h1>
							</div>
						}
						captionText={experience.Title}
					/>

					<div data-color-mode="light">
						<RichTextContent html={experience.Description} />
					</div>
				</>)}
			</div>

			<div className={styles.hobbies_container}>
				<h2>Not Just Work</h2>

				{hobbies.map(hobby =>
					<div className={styles.hobby}>
						<TiltedCard
							key={hobby.ID}
							imageSrc={hobby.Picture}
							overlayContent={
								<div className={styles.overlay}>
									<h1>{hobby.Title}</h1>
								</div>
							}
							captionText={hobby.Title}
						/>
						<div data-color-mode="light">
							<RichTextContent html={hobby.Description} />
						</div>
					</div>
				)}
			</div>

			<p className={styles.footer}>Project made with ❤️ by <a href="https://dylanyeowf.pages.dev">Dylan</a></p>
		</main>
	);
}