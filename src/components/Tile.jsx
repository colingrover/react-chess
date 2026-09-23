import styles from './Tile.module.css';

export default function Tile({ rank, file, piece, selected, highlighted, handlePointerDown, handlePointerUp }) {
    const pointerDownCaller = (e) => {
        e.preventDefault();
        handlePointerDown(rank, file);
    };

    const pointerUpCaller = (e) => {
        e.preventDefault();
        handlePointerUp(rank, file);
    };

    const isDark = (rank + file) % 2 === 0;

    return (
        <div 
            className={`${styles.tile} 
                        ${isDark ? styles.dark : styles.light}
                        ${piece !== null ? styles.piece : null}
                        ${piece !== null ? styles[`${piece.type}-${piece.colour}`] : null}
                        ${selected === true ? styles.selected : null}
                        ${highlighted === true ? styles.highlighted : null}`}
            onPointerDown={pointerDownCaller}
            onPointerUp={pointerUpCaller}
        >
        </div>
    );
}