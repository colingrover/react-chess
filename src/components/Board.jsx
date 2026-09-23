import Tile from './Tile.jsx';
import { NUM_FILES, NUM_RANKS } from '../constants.js';
import styles from './Board.module.css';

export default function Board({board, highlighted, selectedSquare, handlePointerDown, handlePointerUp}) {
    return (
        <div className={styles.chessboard}>
            {/* 1. Reverse array iteration order so Rank 7 renders at top and Rank 0 at bottom */}
            {board.map((rankRow, rankIndex) => ({ rankRow, rankIndex }))
                .reverse()
                .map(({ rankRow, rankIndex }) => (
                    rankRow.map((piece, fileIndex) => (
                        <Tile
                            key={`${rankIndex}-${fileIndex}`}
                            rank={rankIndex} // Preserves true rank index (0 = White back rank)
                            file={fileIndex}
                            piece={piece}
                            selected={selectedSquare !== null && selectedSquare.rank === rankIndex && selectedSquare.file === fileIndex}
                            highlighted={highlighted === null ? false : highlighted[rankIndex][fileIndex]}
                            handlePointerDown={handlePointerDown}
                            handlePointerUp={handlePointerUp}
                        />
                    ))
            ))}
        </div>
    );
}