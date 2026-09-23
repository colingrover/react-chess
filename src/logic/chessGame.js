import Board from "./board.js";
import {Piece, ROOK_DIRECTIONS, BISHOP_DIRECTIONS, QUEEN_DIRECTIONS, KNIGHT_OFFSETS, KING_OFFSETS} from "./piece.js";
import { NUM_FILES, NUM_RANKS } from "../constants.js";

/* TODO:
 *  - En passant
 *  - Castling
 *  - Detect check
 *  - Force user to get out of check
 *  - Disallow moves that would put player in check
 */

export default class ChessGame {
    #board = null;
    #turn = null;

    constructor() {
        this.#board = new Board();
        this.#turn = Piece.Colour.WHITE;
        // TODO: Add whose turn it is, other game state info here
    }

    /**
     * Returns a lightweight plain object matrix for UI rendering or serialization.
     * 
     * @returns {Array<Array<{ colour: string, type: string }|null>>}
     */
    getBoardSnapshot() {
        return this.#board.grid.map(rank =>
            rank.map(filePiece => 
                filePiece ? { colour: filePiece.colour, type: filePiece.type } : null
            )
        );
    }

    /**
     * @brief To be used to get an array of which moves to highlight as potentially
     * legal for any given piece
     * 
     * @param {number} rank 
     * @param {number} file 
     * 
     * @returns boolean array (same dimensions as board), with allowed moves as true 
     * and disallowed moves as false. Doesn't include checks for if move would endanger
     * the king, so move not necessarily legal. If square without piece selected, 
     * returns null.
     */
    getBasicMoves(rank, file) {
        if (rank < 0 || rank >= NUM_RANKS || file < 0 || file >= NUM_FILES) {
            throw new Error(`Rank or file outside of expected range. Received rank ${rank} and file ${file}. Rank should be in range [0, ${NUM_RANKS}) and file should be in range [0, ${NUM_FILES}).`);
        }

        // If no piece on target square, then there are no associated moves
        if (this.#board.grid[rank][file] === null) {
            return null;
        }

        // Initialize array of all possible moves to entirely false grid
        const ret = Array(NUM_RANKS).fill(false).map(() => Array(NUM_FILES).fill(false));

        switch(this.#board.grid[rank][file].type) {
            case Piece.Type.ROOK:
                this.#getSlidingMoves(rank, file, ret, ROOK_DIRECTIONS);
                break;
            case Piece.Type.KNIGHT:
                this.#getOffsetMoves(rank, file, ret, KNIGHT_OFFSETS);
                break;
            case Piece.Type.BISHOP:
                this.#getSlidingMoves(rank, file, ret, BISHOP_DIRECTIONS);
                break;
            case Piece.Type.QUEEN:
                this.#getSlidingMoves(rank, file, ret, QUEEN_DIRECTIONS);
                break;
            case Piece.Type.KING:
                this.#getOffsetMoves(rank, file, ret, KING_OFFSETS);
                break;
            case Piece.Type.PAWN:
                this.#getPawnMoves(rank, file, ret);
                break;
            default:
                throw new Error(`Unexpected piece type: ${this.#board.grid[rank][file].type}`);
        }

        return ret;
    }

    /**
     * @brief Helper for getBasicMoves that handles pieces that slide
     * 
     * @param {number} rank 
     * @param {number} file 
     * @param {Array<[boolean, boolean]>} allowedMoves The board array that we are modifying, with true squares showing allowed moves
     * @param {Array<[number, number]>} directions List of directions that this piece can slide in
     */
    #getSlidingMoves(rank, file, allowedMoves, directions) {
        for (const [rankDir, fileDir] of directions) {
            // Take first step in target direction
            let targetRank = rank + rankDir;
            let targetFile = file + fileDir;

            while (targetRank > 0 && targetFile > 0 && targetRank < NUM_RANKS && targetFile < NUM_FILES) {
                if (this.#board.grid[targetRank][targetFile] === null) {
                    // Allow move if target square is empty
                    allowedMoves[targetRank][targetFile] = true;
                } else if (this.#board.grid[targetRank][targetFile].colour === this.#board.grid[rank][file].colour) {
                    // Stop if we encounter one of our own pieces
                    // TODO: Make sure this doesn't interfere with castling
                    break;
                } else {
                    // Set move to allowed, then stop if we encounter one of opponent's pieces
                    allowedMoves[targetRank][targetFile] = true;
                    break;
                }

                targetRank += rankDir;
                targetFile += fileDir;
            }
        }
    }

    /**
     * @brief Helper for getBasicMoves that handles pieces that offset (knight, king)
     * 
     * @param {number} rank 
     * @param {number} file 
     * @param {Array<[boolean, boolean]>} allowedMoves The board array that we are modifying, with true squares showing allowed moves
     * @param {Array<[number, number]>} directions List of offset moves this piece can make
     */
    #getOffsetMoves(rank, file, allowedMoves, offsets) {
        for (const [rankOff, fileOff] of offsets) {
            const targetRank = rank + rankOff;
            const targetFile = file + fileOff;
            
            if (targetRank < 0 || targetRank >= NUM_RANKS || targetFile < 0 || targetFile >= NUM_FILES) {
                // Skip out-of-bounds options
                continue;
            } else if (this.#board.grid[targetRank][targetFile] === null) {
                // Allow move if target square is empty
                allowedMoves[targetRank][targetFile] = true;
            } else if (this.#board.grid[targetRank][targetFile].colour === this.#board.grid[rank][file].colour) {
                // Don't allow if we encounter one of our own pieces
                continue;
            } else {
                // Allow move if we would be taking
                allowedMoves[targetRank][targetFile] = true;
            }
        }
    }

    #getPawnMoves(rank, file, allowedMoves) {
        const direction = (this.#board.grid[rank][file].colour === Piece.Colour.WHITE) ? 1 : -1;

        // If we're not in last rank
        if (rank + direction > 0 && rank + direction < NUM_RANKS) {
            // Allow square directly in front of pawn if it's empty
            if (this.#board.grid[rank + direction][file] === null) {
                allowedMoves[rank + direction][file] = true;

                // Allow next square up if it's empty and pawn hasn't yet moved (also check valid rank juuuuust in case)
                if (!this.#board.grid[rank][file].hasMoved && rank + (2*direction) > 0 
                                                           && rank + (2*direction) < NUM_RANKS 
                                                           && this.#board.grid[rank + (2*direction)][file] === null) {
                    allowedMoves[rank + (2*direction)][file] = true;
                }
            }

            // Check for takes on diagonals
            if (file + 1 < NUM_FILES && this.#board.grid[rank+direction][file+1] !== null && this.#board.grid[rank+direction][file+1].colour !== this.#board.grid[rank][file].colour) {
                allowedMoves[rank+direction][file+1] = true;
            }
            if (file - 1 > 0 && this.#board.grid[rank+direction][file-1] !== null && this.#board.grid[rank+direction][file-1].colour !== this.#board.grid[rank][file].colour) {
                allowedMoves[rank+direction][file-1] = true;
            }
        }
    }

    #changeTurn() {
        if (this.#turn === Piece.Colour.WHITE) {
            this.#turn = Piece.Colour.BLACK;
        } else {
            this.#turn = Piece.Colour.WHITE;
        }
    }

    attemptMove(oldRank, oldFile, newRank, newFile) {
        // TODO: Logic for if the move should actually be allowed
        if (oldRank < 0 || oldRank >= NUM_RANKS || oldFile < 0 || oldFile >= NUM_FILES) {
            throw new Error(`Old rank or file outside of expected range. Received rank ${rank} and file ${file}. Rank should be in range [0, ${NUM_RANKS}) and file should be in range [0, ${NUM_FILES}).`);
        }

        if (newRank < 0 || newRank >= NUM_RANKS || newFile < 0 || newFile >= NUM_FILES) {
            throw new Error(`New rank or file outside of expected range. Received rank ${rank} and file ${file}. Rank should be in range [0, ${NUM_RANKS}) and file should be in range [0, ${NUM_FILES}).`);
        }

        if (this.#board.grid[oldRank][oldFile] === null) {
            throw new Error(`Attempted to move piece from empty square at rank ${oldRank} and file ${oldFile}.`);
        }

        // Don't allow move if not that player's turn
        if (this.#board.grid[oldRank][oldFile].colour !== this.#turn) {
            return;
        }

        this.#board.move(oldRank, oldFile, newRank, newFile);
        this.#changeTurn();
    }
}
