import Tile from './Tile.jsx';
import styles from './Board.module.css';
import tileStyles from './Tile.module.css';

export default function Board({board, 
                               selectedSquare, 
                               highlighted, 
                               suggestedMove,
                               showHint,
                               pendingPromotion,
                               handlePromotionChoice,
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
                                hintFrom={
                                    showHint &&
                                    suggestedMove?.from.rank === rankIndex &&
                                    suggestedMove?.from.file === fileIndex
                                }
                                hintTo={
                                    showHint &&
                                    suggestedMove?.to.rank === rankIndex &&
                                    suggestedMove?.to.file === fileIndex
                                }
                                handlePointerDown={handlePointerDown}
                                handlePointerMove={handlePointerMove}
                                handlePointerUp={handlePointerUp}
                            />
                        );
                    })
            ))}

            {pendingPromotion && (
                <div
                    className={`${styles.promotionPicker} ${
                        pendingPromotion.colour === 'black'
                            ? styles.promotionPickerBlack
                            : styles.promotionPickerWhite
                    }`}
                    style={{ left: `${pendingPromotion.to.file * 12.5}%` }}
                    role="group"
                    aria-label="Choose a promotion piece"
                >
                    {['queen', 'rook', 'bishop', 'knight'].map((type) => (
                        <button
                            key={type}
                            className={`${styles.promotionOption} ${tileStyles.piece} ${tileStyles[`${type}-${pendingPromotion.colour}`]}`}
                            type="button"
                            aria-label={`Promote to ${type}`}
                            title={`Promote to ${type}`}
                            onClick={() => handlePromotionChoice(type)}
                        />
                    ))}
                </div>
            )}

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