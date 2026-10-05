import Tile from './Tile.jsx';
import styles from './Board.module.css';
import tileStyles from './Tile.module.css';

export default function Board({board, 
                               selectedSquare, 
                               highlighted, 
                               draggedPiece, 
                               dragPosition, 
                               handlePointerDown, 
                               handlePointerMove,
                               handlePointerUp}) {
    return (
        <div className={styles.chessboard}>
            {/* Main chess board (tiles & static pieces) */}
            {board.map((rankRow, rankIndex) => ({ rankRow, rankIndex }))
                .reverse()
                .map(({ rankRow, rankIndex }) => (
                    rankRow.map((piece, fileIndex) => {
                        const pieceIsDraggedFromThisSquare = draggedPiece?.from.rank === rankIndex && draggedPiece?.from.file === fileIndex;
                        return (
                            <Tile
                                key={`${rankIndex}-${fileIndex}`}
                                rank={rankIndex}
                                file={fileIndex}
                                piece={pieceIsDraggedFromThisSquare ? null : piece}
                                selected={
                                    selectedSquare !== null && 
                                    selectedSquare.rank === rankIndex && 
                                    selectedSquare.file === fileIndex
                                }
                                highlighted={
                                    highlighted === null ? false : highlighted[rankIndex][fileIndex]
                                }
                                handlePointerDown={handlePointerDown}
                                handlePointerMove={handlePointerMove}
                                handlePointerUp={handlePointerUp}
                            />
                        );
                    })
            ))}

            {/* Dragged piece */}
            {draggedPiece && dragPosition && (
                <div 
                    className={`${tileStyles.piece}
                                ${tileStyles[`${draggedPiece.piece.type}-${draggedPiece.piece.colour}`]}
                                ${styles.draggedPiece}`}
                    style={{
                        left: dragPosition.x,
                        top: dragPosition.y
                    }}
                />
            )}
        </div>
    );
}