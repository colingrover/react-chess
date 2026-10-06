import { useState, useRef, useCallback } from 'react';
import ChessGame from '../logic/chessGame.js';
import MoveDisallowedError from '../logic/moveDisallowedError.js';
import Board from '../logic/board.js';

async function postChessApi(data = {}) {
    const response = await fetch('https://chess-api.com/v1', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error(`Chess API request failed (${response.status}).`);
    }

    const responseJSON = await response.json();

    if (responseJSON.type === "error") {
        throw new Error(`Chess API request failed (${responseJSON.text}).`);
    }

    return responseJSON;
}

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
    const [suggestedMove, setSuggestedMove] = useState(null);
    const [winChance, setWinChance] = useState(50.0);
    const [showHint, setShowHint] = useState(false);

    // Helper to trigger a React render whenever the underlying engine state changes
    const updateUI = useCallback(() => {
        setBoardSnapshot(gameRef.current.getBoardSnapshot());
    }, []);

    // Prompt the chess engine for a hint & evaluate win %
    const promptEngine = useCallback(async () => {
        setSuggestedMove(null);

        try {
            const result = await postChessApi({ fen: gameRef.current.getFEN() });

            if (!result || typeof result !== 'object') {
                throw new Error('Chess API returned an invalid response.');
            }

            setSuggestedMove({
                from: Board.getRankAndFileFromNotationName(result.from),
                to: Board.getRankAndFileFromNotationName(result.to),
                san: (typeof result.san === 'string' ? result.san : null),
            });

            setWinChance(result.winChance);
        } catch (error) {
            if (error instanceof Error) {
                console.error(error.message);
            } else {
                String(error);
            }
        }
    }, []);

    const requestHint = useCallback(() => {
        setShowHint(true);
    }, [])

    // Helper to try and make a move
    const attemptMove = useCallback((fromRank, fromFile, toRank, toFile) => {
        setSuggestedMove(null);

        try {
            gameRef.current.attemptMove(fromRank, fromFile, toRank, toFile);
            setShowHint(false);
            promptEngine();
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
        // If the player has already selected a piece, and is now clicking on one of its
        // allowed moves, then we don't have to bother with this stuff as it would be
        // unnecessary/redundant 
        if (selectedSquare !== null && moveOptions?.[rank]?.[file] === true) {
            return;
        }

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
    }, [boardSnapshot, moveOptions, selectedSquare]);

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
        // Ignore if we haven't actually selected a piece to move
        if (selectedSquare === null) {return;}

        // Only allow pseudo-legal moves to even be attempted
        const isMoveOption = moveOptions?.[rank]?.[file] === true;

        if (isMoveOption) {
            // TODO: React somehow to when moves are refused that indicates why to the player
            // (e.g., not your turn, move would put you in check, etc.)
            attemptMove(
                selectedSquare.rank,
                selectedSquare.file,
                rank,
                file,
            );
        }

        // Release piece
        setDraggedPiece(null);
        setDragPosition(null);
    }, [attemptMove, moveOptions, selectedSquare]);

    const getTurn = useCallback(() => gameRef.current.getTurn(), []);

    return {
        boardSnapshot,
        selectedSquare,
        moveOptions,
        suggestedMove,
        draggedPiece,
        dragPosition,
        winChance,
        showHint,
        handlePointerDown,
        handlePointerMove,
        handlePointerUp,
        requestHint,
        getTurn
    };
}