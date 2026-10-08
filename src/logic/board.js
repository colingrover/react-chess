import { NUM_FILES, NUM_RANKS } from "../constants.js";
import {Piece} from "./piece.js";

export default class Board {
    /**
     * E.g., `getSquareNotationName(0, 2)` → "c1"
     * @param {number} rank 
     * @param {number} file 
     * @returns {string} Algebraic notation representation of requested square
     */
    static getSquareNotationName(rank, file) {
        return `${String.fromCharCode("a".charCodeAt(0) + file)}${rank + 1}`
    }

    /**
     * E.g., "c1" → `{rank: 0, file: 2}`
     * @param {string} square 
     * @returns Rank/file from algebraic notation
     */
    static getRankAndFileFromNotationName(square) {
        if (typeof square !== 'string' || !/^[a-h][1-8]$/.test(square)) {
            throw new Error(`Invalid square: ${square}`);
        }

        return {
            rank: Number(square[1]) - 1,
            file: square.charCodeAt(0) - 'a'.charCodeAt(0)
        };
    }

    constructor() {
        this.grid = Array.from({ length: NUM_RANKS }, () => Array(NUM_FILES).fill(null));
        this.#init();
    }

    /**
     * Sets/resets board to initial state
     */
    #init() {
        const BACK_RANK_TYPES = [
            Piece.Type.ROOK,
            Piece.Type.KNIGHT,
            Piece.Type.BISHOP,
            Piece.Type.QUEEN,
            Piece.Type.KING,
            Piece.Type.BISHOP,
            Piece.Type.KNIGHT,
            Piece.Type.ROOK
        ];

        const WHITE_BACK_RANK = 0;
        const WHITE_PAWN_RANK = 1;
        const BLACK_BACK_RANK = NUM_RANKS-1;
        const BLACK_PAWN_RANK = NUM_RANKS-2;

        for (let file = 0; file < NUM_FILES; file++) {
            // Non-pawn pieces
            this.grid[WHITE_BACK_RANK][file] = new Piece({ colour: Piece.Colour.WHITE, type: BACK_RANK_TYPES[file] });
            this.grid[BLACK_BACK_RANK][file] = new Piece({ colour: Piece.Colour.BLACK, type: BACK_RANK_TYPES[file] });

            // Pawns
            this.grid[WHITE_PAWN_RANK][file] = new Piece({ colour: Piece.Colour.WHITE, type: Piece.Type.PAWN });
            this.grid[BLACK_PAWN_RANK][file] = new Piece({ colour: Piece.Colour.BLACK, type: Piece.Type.PAWN });
        }
    }

    /**
     * Removes all pieces from board
     */
    #clear() {    
        // Clear existing grid
        for (let i = 0; i < NUM_RANKS; i++) {
            this.grid[i].fill(null);
        }
    }

    /**
     * Reset board to initial state
     */
    reset() {
        this.#clear();
        this.#init();
    }

    /**
     * Move piece across board
     * 
     * @param {number} oldRank 
     * @param {number} oldFile 
     * @param {number} newRank 
     * @param {number} newFile 
     */
    move(oldRank, oldFile, newRank, newFile) {
        this.grid[newRank][newFile] = this.grid[oldRank][oldFile];
        this.grid[newRank][newFile].hasMoved = true;
        this.grid[oldRank][oldFile] = null;
    }

    /**
     * 
     * @param {number} rank 
     * @param {number} file 
     * @param {*} type 
     */
    promote(rank, file, type) {
        const pawn = this.grid[rank][file];
        if (pawn === null || pawn.type !== Piece.Type.PAWN) {
            throw new Error("Only a pawn can be promoted.");
        }

        this.grid[rank][file].type = type;
    }

    /**
     * Get current board state in Forsyth-Edwards Notation (doesn't get 
     * active colour, castling rights, possible en passant targets, halfmove 
     * clock, or fullmove number)
     * @returns {string}
     */
    getFEN() {
        let ret = "";

        for (let rank = NUM_RANKS-1; rank >= 0; rank--) {
            if (rank < NUM_RANKS-1) {
                ret += "/";
            }

            const rankContents = this.grid[rank];

            let consecutiveBlanks = 0;

            for (const piece of rankContents) {
                if (piece === null) {
                    consecutiveBlanks++;
                } else {
                    if (consecutiveBlanks > 0) {
                        ret += consecutiveBlanks;
                        consecutiveBlanks = 0;
                    }

                    ret += piece.getFEN();
                }
            }

            if (consecutiveBlanks > 0) {
                ret += consecutiveBlanks;
            }
        }

        return ret;
    }

}