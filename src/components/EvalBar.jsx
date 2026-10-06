import styles from './EvalBar.module.css';

export default function EvalBar({ percentage }) {
    return (
        <div className={styles["win-chance-bar"]}>
            <div className={styles["win-chance-fill"]} style={{ width: `${percentage}%` }}></div>
        </div>
    )
    
}