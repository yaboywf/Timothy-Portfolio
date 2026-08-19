import { Outlet } from "react-router-dom";
import styles from './layout.module.css'

export default function Layout() {
    return (
        <>
            <Outlet />
            <p className={styles.footer}>Project made with ❤️ by <a href="https://dylanyeowf.pages.dev">Dylan</a></p>
        </>
    )
}