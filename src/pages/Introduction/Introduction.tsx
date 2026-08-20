import { SignedImage } from "@/components/SignedImage";
import styles from "./introduction.module.css"
import BlurText from "@/components/TextEffect";
import CardSwap, { Card } from "@/components/CardSwap";
import Projects from "@/data/Projects.json"
import Educations from "@/data/Education.json"
import TiltedCard from "@/components/TiltedCard";
import Experiences from "@/data/Experience.json";

export default function Introduction() {
	return (
		<>
			<div className={styles.introduction}>
				<div className={styles.image_container}>
					<SignedImage path="Profile.webp" alt="Profile" className={styles.image} />
				</div>
				<div className={styles.container}>
					<BlurText text="Hello!" className={styles.subtitle} />
					<BlurText text="I'm Timothy Ho" className={styles.title} />
					<p>Year 3 DARE student | Diploma in Aeronautical Engineering</p>

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
				<article>
					I am currently pursuing a Diploma in Aeronautical Engineering at Singapore Polytechnic, where I have built a strong foundation in aircraft systems, avionics, aircraft powerplant, aerodynamics, engineering mechanics, and CAD design using CATIA. My passion for aviation extends into Formula 1, where I am especially interested in aerodynamics and performance engineering.
					<br /><b></b>
					Through my studies, I have gained technical knowledge in aircraft electrical and instrument systems, navigation systems, propulsion systems, and engineering design principles. A key highlight was completing a cornerstone project where my team and I designed and built a glider, allowing me to apply concepts such as aerodynamics, stability, structural design, and weight optimisation while strengthening my teamwork and problem-solving skills.
					<br /><br />
					I am also pursuing an Aviation Management Certificate, where I learned about airline operations, airport terminal operations, ramp operations, and airside safety. These modules broadened my understanding of the aviation industry beyond engineering and strengthened my appreciation for operational efficiency and coordination within airports and airlines.
					<br /><br />
					Beyond academics, I am an active member of Singapore Polytechnic’s Bowling School Team and Aviation Club. Competing in events such as the Singapore International Open has strengthened my discipline and ability to perform under pressure. I also participated in F1 in Schools, which further developed my interest in engineering innovation, teamwork, and performance optimisation.
					<br /><br />
					As an aspiring aeronautical engineer, I am eager to continue learning and contribute meaningfully to the aerospace industry through both technical and operational knowledge.
				</article>
			</div>

			<div className={styles.card_container}>
				<p className={styles.title}>What I've been up to</p>
				<p className={styles.subtitle}>A few things I’ve built, explored, and improved along the way.</p>
				<CardSwap
					cardDistance={60}
					verticalDistance={70}
					delay={15000}
					pauseOnHover={false}
				>
					{Projects.map(project => (
						<Card className={styles.card}>
							<h3>{project.Name}</h3>
							<div>
								<SignedImage path={project.Picture} alt={project.Name} className={styles.image} />
								<p>{project.Description}</p>
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
					{Educations.map(education => (
						<div className={styles.card} key={education.Title}>
							<div className={styles.left}>
								<img src={`/images/${education.Picture}`} alt={education.Title} />
								<div className={styles.line}></div>
							</div>
							<div>
								<h2>{education.Title}</h2>
								<p>{education.Description}</p>
							</div>
						</div>
					))}
				</div>
			</div>

			<div className={`${styles.hobbies_container} ${styles.work_container}`}>
				<h2>Work Also Matters!</h2>

				{Experiences.map(experience => <>
					<TiltedCard
						imageSrc={experience.Picture}
						isSignedImage={false}
						overlayContent={
							<div className={styles.overlay}>
								<h1>{experience.Title}</h1>
							</div>
						}
						captionText={experience.Title}
					/>

					<p>
						{experience.Description}
					</p>
				</>)}
			</div>

			<div className={styles.hobbies_container}>
				<h2>Not Just Work</h2>

				<TiltedCard
					imageSrc="Competitive-Bowling.webp"
					isSignedImage={true}
					overlayContent={
						<div className={styles.overlay}>
							<h1>Competitive Bowling</h1>
						</div>
					}
					captionText="Competitive Bowling"
				/>

				<TiltedCard
					imageSrc="F1.webp"
					isSignedImage={true}
					overlayContent={
						<div className={styles.overlay}>
							<h1>Formula 1</h1>
						</div>
					}
					captionText="Formula 1"
				/>

				<p>
					A passionate Formula 1 enthusiast who regularly attends F1 events and engages with the sport beyond simply watching races. Formula 1 has developed my appreciation for engineering, precision, innovation, and continuous improvement, while teaching me the importance of perseverance and resilience — a mistake or setback does not mean the race is over, but rather an opportunity to keep pushing forward. My interest extends into the technical side of the sport, where I independently use CAD to design and model Formula 1 cars, allowing me to explore vehicle aerodynamics, structural design, and engineering principles through a practical and creative approach.
				</p>

				<p>
					Represented and competed in the Singapore International Open (SIO), gaining experience competing against high-level bowlers in an international competitive environment. Also represented my team in the National Service Games (NSG) and regularly participate in local bowling leagues. These experiences have strengthened my discipline, consistency, mental resilience, and ability to perform under pressure while competing both individually and as part of a team.
				</p>
			</div>

			<p className={styles.footer}>Project made with ❤️ by <a href="https://dylanyeowf.pages.dev">Dylan</a></p>
		</>
	);
}