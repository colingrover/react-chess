import Tile from './Tile.jsx';
import styles from './Board.module.css';
import tileStyles from './Tile.module.css';
import { Piece } from '../logic/piece.js';
import { NUM_FILES } from '../constants.js';

export default function Board({board, 
                               selectedSquare, 
                               highlighted, 
                               suggestedMove,
                               showHint,
                               pendingPromotion,
                               applyUsersPromotionChoice,
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

            {/* Promotion menu */}
            {pendingPromotion && (
                <div
                    className={`${styles.promotionPicker} ${
                        pendingPromotion.colour === Piece.Colour.BLACK
                            ? styles.promotionPickerBlack
                            : null
                    }`}
                    style={{ left: `${pendingPromotion.to.file * (100.0/NUM_FILES)}%` }}
                    role="group"
                    aria-label="Choose a promotion piece"
                >
                    {[Piece.Type.QUEEN, Piece.Type.ROOK, Piece.Type.BISHOP, Piece.Type.KNIGHT].map((type) => (
                        <button
                            key={type}
                            className={`${styles.promotionOption} ${tileStyles.piece} ${tileStyles[`${type}-${pendingPromotion.colour}`]}`}
                            type="button"
                            aria-label={`Promote to ${type}`}
                            title={`Promote to ${type}`}
                            onClick={() => applyUsersPromotionChoice(type)}
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