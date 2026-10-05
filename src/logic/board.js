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
        // if (oldRank < 0 || oldRank >= NUM_RANKS || oldFile < 0 || oldFile >= NUM_FILES) {
        //     throw new Error(`Old rank or file outside of expected range. Received rank ${rank} and file ${file}. Rank should be in range [0, ${NUM_RANKS}) and file should be in range [0, ${NUM_FILES}).`);
        // }

        // if (newRank < 0 || newRank >= NUM_RANKS || newFile < 0 || newFile >= NUM_FILES) {
        //     throw new Error(`New rank or file outside of expected range. Received rank ${rank} and file ${file}. Rank should be in range [0, ${NUM_RANKS}) and file should be in range [0, ${NUM_FILES}).`);
        // }

        this.grid[newRank][newFile] = this.grid[oldRank][oldFile];
        this.grid[newRank][newFile].hasMoved = true;
        this.grid[oldRank][oldFile] = null;
        // console.log(`${this.grid[newRank][newFile].colour} ${this.grid[newRank][newFile].type} from ${Board.getSquareNotationName(oldRank, oldFile)} to ${Board.getSquareNotationName(newRank, newFile)}`)
    }


}