import { useState, useRef, useCallback, useEffect } from 'react';
import ChessGame from '../logic/chessGame.js';
import MoveDisallowedError from '../logic/moveDisallowedError.js';
import Board from '../logic/board.js';
import { Piece } from '../logic/piece.js';
import { getChessAnalysis } from '../engine/chessApi.js';

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
    const [winChance, setWinChance] = useState(53.0);
    const [showHint, setShowHint] = useState(false);
    const [autoplayBlack, setAutoplayBlack] = useState(false);
    // const [engineDepth, setEngineDepth] = useState(12);
    const autoplayBlackRef = useRef(autoplayBlack);
    autoplayBlackRef.current = autoplayBlack;

    // Helper to trigger a React render whenever the underlying engine state changes
    const updateUI = useCallback(() => {
        setBoardSnapshot(gameRef.current.getBoardSnapshot());
    }, []);

    const getTurn = useCallback(() => gameRef.current.getTurn(), []);

    const applyMove = useCallback((fromRank, fromFile, toRank, toFile) => {
        let moveWasApplied = false;

        try {
            gameRef.current.attemptMove(fromRank, fromFile, toRank, toFile);
            moveWasApplied = true;
            setShowHint(false);
        } catch (error) {
            if (error instanceof MoveDisallowedError) {
                switch (error.code) {
                    case MoveDisallowedError.SELF_CHECK:
                    case MoveDisallowedError.OUT_OF_TURN:
                        console.warn(error.message);
                        break;
                    case MoveDisallowedError.GENERIC:
                    default:
                        console.error(error.message);
                        break;
                }
            } else {
                throw error;
            }
        }

        setSelectedSquare(null);
        setMoveOptions(null);
        updateUI();
        return moveWasApplied;
    }, [updateUI]);

    // Prompt the chess engine for a hint & evaluate win %
    const promptEngine = useCallback(async function promptEngine() {
        setSuggestedMove(null);

        try {
            const result = await getChessAnalysis({
                fen: gameRef.current.getFEN(),
                // depth: Math.min(18, Math.max(engineDepth, 1))
            });

            if (!result || typeof result !== 'object') {
                throw new Error('Chess API returned an invalid response.');
            }

            const from = Board.getRankAndFileFromNotationName(result.from);
            const to = Board.getRankAndFileFromNotationName(result.to);

            setSuggestedMove({
                from,
                to,
                san: (typeof result.san === 'string' ? result.san : null),
            });

            setWinChance(result.winChance);

            if (autoplayBlackRef.current && getTurn() === Piece.Colour.BLACK) {
                if (applyMove(from.rank, from.file, to.rank, to.file)) {
                    await promptEngine();
                }
            }
        } catch (error) {
            if (error instanceof Error) {
                console.error(error.message);
            } else {
                String(error);
            }
        }
    }, [applyMove, /* engineDepth, */ getTurn]);

    const requestHint = useCallback(() => {
        setShowHint(true);
        promptEngine();
    }, [promptEngine]);

    // Helper to try and make a move
    const attemptMove = useCallback((fromRank, fromFile, toRank, toFile) => {
        setSuggestedMove(null);

        if (applyMove(fromRank, fromFile, toRank, toFile)) {
            promptEngine();
        }
    }, [applyMove, promptEngine]);

    useEffect(() => {
        if (autoplayBlack && getTurn() === Piece.Colour.BLACK) {
            promptEngine();
        }
    }, [autoplayBlack, getTurn, promptEngine]);

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

    return {
        boardSnapshot,
        selectedSquare,
        moveOptions,
        suggestedMove,
        draggedPiece,
        dragPosition,
        winChance,
        showHint,
        autoplayBlack,
        // engineDepth,
        handlePointerDown,
        handlePointerMove,
        handlePointerUp,
        requestHint,
        getTurn,
        setAutoplayBlack,
        // setEngineDepth
    };
}