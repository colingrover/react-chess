import { useState, useRef, useCallback } from 'react';
import ChessGame from '../logic/chessGame.js';
import MoveDisallowedError from '../logic/moveDisallowedError.js';

export function useChessGame() {
    // 1. Maintain a persistent instance across renders using useRef
    const gameRef = useRef(null);
    if (!gameRef.current) {
        gameRef.current = new ChessGame();
    }

    // 2. Mirror the lightweight snapshot in React state to drive UI updates
    const [boardSnapshot, setBoardSnapshot] = useState(() => 
        gameRef.current.getBoardSnapshot()
    );

    const [selectedSquare, setSelectedSquare] = useState(null); // { rank, file }
    const [moveOptions, setMoveOptions] = useState(null); // 8x8 boolean grid

    // Helper to trigger a React render whenever the underlying engine state changes
    const updateUI = useCallback(() => {
        setBoardSnapshot(gameRef.current.getBoardSnapshot());
    }, []);

    // Helper to try and make a move
    const attemptMove = useCallback((fromRank, fromFile, toRank, toFile) => {

        try {
            gameRef.current.attemptMove(fromRank, fromFile, toRank, toFile);
        } catch (error) {
            if (error instanceof MoveDisallowedError) {
                switch (error.code) {
                    case MoveDisallowedError.SELF_CHECK:
                        // TODO:
                        console.warn(error.message)
                        break;
                    case MoveDisallowedError.OUT_OF_TURN:
                        // TODO:
                        console.warn(error.message)
                        break;
                    case MoveDisallowedError.GENERIC:
                    default:
                        // TODO:
                        console.error(error.message)
                        break;
                }
            } else {
                // Fully unexpected error :(
                throw error;
            }
        }

        setSelectedSquare(null); // Deselect square we moved from
        setMoveOptions(null); // Stop displaying move options after game state has changed
        updateUI(); // Update UI to reflect the new board state after the move
    }, [updateUI]);

    // For when user is moving a piece
    const [draggedPiece, setDraggedPiece] = useState(null);
    const [dragPosition, setDragPosition] = useState(null);

    // Used for when user clicks on a square (ideally with a piece on it)
    const handlePointerDown = useCallback((rank, file, event) => {
        const piece = boardSnapshot[rank][file];

        if (piece === null) {
            return;
        }
        
        // Update selected square to that of current piece so it can be highlighted
        setSelectedSquare({ rank, file });

        // Update moveOptions to highlight available moves based on selected piece
        setMoveOptions(gameRef.current.getBasicMoves(rank, file));

        // Update draggedPiece to track piece and where it is being dragged from
        setDraggedPiece({
            piece,
            from: { rank, file },
        });

        // Start dragPosition at where the click occurred
        setDragPosition({
            x: event.clientX,
            y: event.clientY,
        });
    }, [boardSnapshot]);

    // Track piece being moved to the mouse
    const handlePointerMove = useCallback((event) => {
        if (draggedPiece === null) {
            return;
        }

        setDragPosition({
            x: event.clientX,
            y: event.clientY,
        });
    }, [draggedPiece]);

    // Used for when the user releases the mouse button over a square
    const handlePointerUp = useCallback((rank, file) => {
        // Ignore if we aren't dragging anything
        if (draggedPiece === null) {
            return;
        }
        
        // Only allow pseudo-legal moves to even be attempted
        const isMoveOption = moveOptions?.[rank]?.[file] === true;

        if (isMoveOption) {
            // TODO: React somehow to when moves are refused that indicates why to the player
            // (e.g., not your turn, move would put you in check, etc.)
            attemptMove(
                draggedPiece.from.rank,
                draggedPiece.from.file,
                rank,
                file,
            );
        }

        // Release piece
        setDraggedPiece(null);
        setDragPosition(null);
    }, [draggedPiece, moveOptions, updateUI]);

    const getTurn = useCallback(() => gameRef.current.getTurn(), []);

    return {
        boardSnapshot,
        selectedSquare,
        moveOptions,
        draggedPiece,
        dragPosition,
        handlePointerDown,
        handlePointerMove,
        handlePointerUp,
        getTurn
    };
}