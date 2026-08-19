import { SignedImage } from "@/components/SignedImage";
import styles from "./introduction.module.css"
import BlurText from "@/components/TextEffect";

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
						<i className="fa-brands fa-whatsapp"></i>
						<i className="fa-brands fa-instagram"></i>
						<i className="fa-regular fa-envelope"></i>
						<i className="fa-brands fa-linkedin"></i>
					</div>
				</div>
			</div>

			{/* <div className={styles.about_me}>
				<SignedImage path="Introduction.webp" alt="Introduction" className={styles.image} />
			</div> */}
		</>
	);
}