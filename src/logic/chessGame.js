import Board from "./board.js";
import {Piece, ROOK_DIRECTIONS, BISHOP_DIRECTIONS, QUEEN_DIRECTIONS, KNIGHT_OFFSETS, KING_OFFSETS} from "./piece.js";
import { NUM_FILES, NUM_RANKS } from "../constants.js";
import MoveDisallowedError from "./moveDisallowedError.js";

/* TODO:
 *  - En passant
 *  - Detect check
 *  - Force user to get out of check
 *  - Disallow moves that would put player in check
 */

export default class ChessGame {
    #board = null;
    #turn = null;
    #kingLocation = {};
    #numHalfmoves;
    #numFullmoves;
    // #possibleEnPassantTarget = null;

    constructor() {
        this.#board = new Board();
        this.#turn = Piece.Colour.WHITE;

        // Find initial king positions
        let numKingsFound = 0;
        for (const [rank, rankContents] of this.#board.grid.entries()) {
            for (const [file, square] of rankContents.entries()) {
                if (square === null) {continue;}
                
                if (square.type === Piece.Type.KING) {
                    this.#kingLocation[square.colour] = {
                        rank: rank,
                        file: file
                    }
                    numKingsFound++;
                }

                if (numKingsFound >= 2) {break;}
            }

            if (numKingsFound >= 2) {break;}
        }

        this.#numHalfmoves = 0; // TODO: Add game-ending logic for this
        this.#numFullmoves = 1;
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
                this.#getCastleMoves(rank, file, this.#board.grid[rank][file].colour, ret);
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
     * Assumes move is one already generated & confirmed pseudo-legal by `getBasicMoves`
     * @param {*} oldRank 
     * @param {*} oldFile 
     * @param {*} newRank 
     * @param {*} newFile 
     */
    attemptMove(oldRank, oldFile, newRank, newFile, promotionType = null) {
        // Check input bounds
        if (oldRank < 0 || oldRank >= NUM_RANKS || oldFile < 0 || oldFile >= NUM_FILES) {
            throw new Error(`Old rank or file outside of expected range. Received rank ${rank} and file ${file}. Rank should be in range [0, ${NUM_RANKS}) and file should be in range [0, ${NUM_FILES}).`);
        }

        if (newRank < 0 || newRank >= NUM_RANKS || newFile < 0 || newFile >= NUM_FILES) {
            throw new Error(`New rank or file outside of expected range. Received rank ${rank} and file ${file}. Rank should be in range [0, ${NUM_RANKS}) and file should be in range [0, ${NUM_FILES}).`);
        }
        
        const movingPiece = this.#board.grid[oldRank][oldFile];

        if (movingPiece === null) {
            throw new MoveDisallowedError(
                MoveDisallowedError.GENERIC,
                `No piece found on square ${Board.getSquareNotationName(oldRank, oldFile)} to be moved`
            );
        }

        // Don't allow move if not that player's turn
        if (movingPiece.colour !== this.#turn) {
            throw new MoveDisallowedError(
                MoveDisallowedError.OUT_OF_TURN,
                `Cannot move a ${movingPiece.colour} piece on ${this.#turn}'s move`
            );
        }

        // If pawn move or capture, reset halfmove counter (else add to it)
        if (movingPiece.type === Piece.Type.PAWN || this.#board.grid[newRank][newFile] !== null) {
            this.#numHalfmoves = 0;
        } else {
            this.#numHalfmoves++;
        }

        // Check if move is a castle
        const isCastling = (movingPiece.type === Piece.Type.KING &&
            oldFile === 4 &&
            (newFile === 2 || newFile === 6)
        );

        // Can't castle in check
        if (isCastling && this.isPlayerInCheck(this.#turn)) {
            throw new MoveDisallowedError(
                MoveDisallowedError.CHECKED_CASTLE,
                `Cannot castle while in check`
            );
        }

        // Check if move is a promotion
        const isPromotion = ((movingPiece.type === Piece.Type.PAWN) && (newRank === (movingPiece.colour === Piece.Colour.WHITE ? NUM_RANKS - 1 : 0)));
        const validPromotionTypes = [
            Piece.Type.QUEEN,
            Piece.Type.ROOK,
            Piece.Type.BISHOP,
            Piece.Type.KNIGHT,
        ];

        if (isPromotion && promotionType !== null && !validPromotionTypes.includes(promotionType)) {
            throw new MoveDisallowedError(
                MoveDisallowedError.GENERIC,
                `Invalid promotion piece: ${promotionType}`
            );
        }

        // Block the move if it would put the player in check (or leave them there if they are already in check)
        if(this.#doesMovePutSelfInCheck(oldRank, oldFile, newRank, newFile, isCastling)) {
            throw new MoveDisallowedError(
                MoveDisallowedError.SELF_CHECK,
                `Move would leave ${this.#turn}'s king under attack`
            );
        }

        // Actually make the move
        this.#board.move(oldRank, oldFile, newRank, newFile);

        // Make promotion move (if applicable)
        if (isPromotion) {
            this.#board.promote(
                newRank,
                newFile,
                promotionType ?? Piece.Type.QUEEN
            );
        }

        // Move rook too if castling
        if (isCastling) {
            if (newFile === 6) {
                this.#board.move(oldRank, 7, newRank, 5);
            } else if (newFile === 2) {
                this.#board.move(oldRank, 0, newRank, 3);
            }
        }

        // If this move is with the king, update our saved king position
        if (this.#board.grid[newRank][newFile].type === Piece.Type.KING) {
            this.#kingLocation[this.#turn].rank = newRank;
            this.#kingLocation[this.#turn].file = newFile;
        }

        // If black is making a move, increment fullmove counter
        if (this.#turn === Piece.Colour.BLACK) {
            this.#numFullmoves++;
        }

        // Flip whose turn it is
        this.#changeTurn();
    }

    getTurn() {
        return this.#turn
    }

    getFEN() {
        const activeColour = this.#turn === Piece.Colour.WHITE ? "w" : "b";

        let castlingRights = (this.#canCastle(Piece.Colour.WHITE) ? "K" : "");
        castlingRights += (this.#canCastle(Piece.Colour.WHITE, false) ? "Q" : "");
        castlingRights += (this.#canCastle(Piece.Colour.BLACK) ? "k" : "");
        castlingRights += (this.#canCastle(Piece.Colour.BLACK, false) ? "q" : "");
        if (castlingRights === "") {
            castlingRights = "-";
        }

        // TODO: Possible en passant targets
        return `${this.#board.getFEN()} ${activeColour} ${castlingRights} - ${this.#numHalfmoves} ${this.#numFullmoves}`;
    }

    /**
     * Checks if player is in check
     * @param {*} playerColour 
     * @param {*} boardSnapshot 
     * @param {*} kingPos 
     * @returns {boolean}
     */
    isPlayerInCheck(playerColour, boardSnapshot=this.getBoardSnapshot(), kingPos = null) {
        // Default to current board and the associated, saved king position
        if (kingPos === null) {
            kingPos = this.#kingLocation[playerColour];
        }

        // Check outward from our king position for opponent pieces possibly attacking it

        // First, check along straight lines & diagonals
        for (const [rankDir, fileDir] of [...ROOK_DIRECTIONS, ...BISHOP_DIRECTIONS]) {
            let targetRank = kingPos.rank + rankDir;
            let targetFile = kingPos.file + fileDir;
            const isDiagonal = (rankDir !== 0) && (fileDir !== 0);

            while (targetRank >= 0 && targetRank < NUM_RANKS && targetFile >= 0 && targetFile < NUM_FILES) {
                const piece = boardSnapshot[targetRank][targetFile];
                
                if (piece !== null) {
                    // If we encounter an opponent's piece along this direction
                    if (piece.colour !== playerColour) {
                        if (piece.type === Piece.Type.QUEEN) {
                            return true;
                        }

                        if (piece.type === Piece.Type.BISHOP && isDiagonal) {
                            return true;
                        }

                        if (piece.type === Piece.Type.ROOK && !isDiagonal) {
                            return true;
                        }
                    }

                    // If we encountered a piece that was not attacking our king, then the rest of this 
                    // direction can be considered "blocked" and not worth checking
                    break;
                }

                // Move on to next square along direction
                targetRank += rankDir;
                targetFile += fileDir;
            }
        }

        // Then, check for knights
        for (const [rankOffset, fileOffset] of KNIGHT_OFFSETS) {
            const targetRank = kingPos.rank + rankOffset;
            const targetFile = kingPos.file + fileOffset;

            if (targetRank >= 0 && targetRank < NUM_RANKS && targetFile >= 0 && targetFile < NUM_FILES) {
                const piece = boardSnapshot[targetRank][targetFile];

                if (piece !== null && piece.colour !== playerColour && piece.type === Piece.Type.KNIGHT) {
                    return true;
                }
            }
        }

        // Then, check for pawns
        const pawnRank = kingPos.rank + (playerColour === Piece.Colour.WHITE ? 1 : -1);
        if (pawnRank < NUM_RANKS && pawnRank >= 0) {
            for (const pawnFile of [kingPos.file-1, kingPos.file+1]) {
                if (pawnFile < 0 || pawnFile >= NUM_FILES) {continue;}
                const piece = boardSnapshot[pawnRank][pawnFile];

                if (piece !== null && piece.colour !== playerColour && piece.type === Piece.Type.PAWN) {
                    return true;
                }
            }
        }

        // Finally, check for opponent's king
        const opponentKingPos = {...this.#kingLocation[(playerColour === Piece.Colour.WHITE ? Piece.Colour.BLACK : Piece.Colour.WHITE)]}
        if (Math.abs(kingPos.rank-opponentKingPos.rank) <= 1 && Math.abs(kingPos.file-opponentKingPos.file) <= 1) {
            return true;
        }
        
        return false;
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

            while (targetRank >= 0 && targetFile >= 0 && targetRank < NUM_RANKS && targetFile < NUM_FILES) {
                if (this.#board.grid[targetRank][targetFile] === null) {
                    // Allow move if target square is empty
                    allowedMoves[targetRank][targetFile] = true;
                } else if (this.#board.grid[targetRank][targetFile].colour === this.#board.grid[rank][file].colour) {
                    // Stop if we encounter one of our own pieces
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
        if (rank + direction >= 0 && rank + direction < NUM_RANKS) {
            // Allow square directly in front of pawn if it's empty
            if (this.#board.grid[rank + direction][file] === null) {
                allowedMoves[rank + direction][file] = true;

                // Allow next square up if it's empty and pawn hasn't yet moved (also check valid rank juuuuust in case)
                if (!this.#board.grid[rank][file].hasMoved && rank + (2*direction) >= 0 
                                                           && rank + (2*direction) < NUM_RANKS 
                                                           && this.#board.grid[rank + (2*direction)][file] === null) {
                    allowedMoves[rank + (2*direction)][file] = true;
                }
            }

            // Check for takes on diagonals
            if (file + 1 < NUM_FILES && this.#board.grid[rank+direction][file+1] !== null && this.#board.grid[rank+direction][file+1].colour !== this.#board.grid[rank][file].colour) {
                allowedMoves[rank+direction][file+1] = true;
            }
            if (file - 1 >= 0 && this.#board.grid[rank+direction][file-1] !== null && this.#board.grid[rank+direction][file-1].colour !== this.#board.grid[rank][file].colour) {
                allowedMoves[rank+direction][file-1] = true;
            }
        }
    }

    #getCastleMoves(rank, file, playerColour, allowedMoves) {
        // First, check king side
        if (this.#canCastle(playerColour, true) && 
            this.#board.grid[rank][file+1] === null &&
            this.#board.grid[rank][file+2] === null) {
            allowedMoves[rank][file+2] = true;
        }

        // Then, check queen side
        if (this.#canCastle(playerColour, false) && 
            this.#board.grid[rank][file-1] === null &&
            this.#board.grid[rank][file-2] === null &&
            this.#board.grid[rank][file-3] === null) {
            allowedMoves[rank][file-2] = true;
        }
    }

    /**
     * Determine whether a given player is still allowed to castle to a given side (not whether they're 
     * currently able to)
     * @param {Piece.Colour} playerColour 
     * @param {boolean} kingSide 
     * @returns {boolean}
     */
    #canCastle(playerColour, kingSide=true) {
        // First, make sure king hasn't moved
        const king = this.#kingLocation[playerColour];
        if (this.#board.grid[king.rank][king.file].hasMoved) {
            return false;
        }

        // Get which rank the rook on our target side SHOULD be on
        const backRank = (playerColour === Piece.Colour.WHITE ? 0 : 7);

        // Depending which side we're checking for, point to right file
        // that rook SHOULD be on
        let rook = this.#board.grid[backRank][7];
        if (!kingSide) {
            rook = this.#board.grid[backRank][0];
        }

        if (rook !== null &&
            rook.colour === playerColour &&
            rook.type === Piece.Type.ROOK &&
            rook.hasMoved === false)
        {
            return true;
        }

        return false;
    }

    /**
     * Checks if potential move would make the player either put or keep themselves in check
     * @param {number} oldRank 
     * @param {number} oldFile 
     * @param {number} newRank 
     * @param {number} newFile 
     * @param {boolean} isCastling
     * 
     * @returns {boolean}
     */
    #doesMovePutSelfInCheck(oldRank, oldFile, newRank, newFile, isCastling) {
        // Get copy of board
        const tempBoard = this.getBoardSnapshot();

        // Make move on our copy of the board
        tempBoard[newRank][newFile] = tempBoard[oldRank][oldFile];
        tempBoard[oldRank][oldFile] = null;

        // Move rook too if castling
        if (isCastling) {
            if (newFile === 6) {
                tempBoard[newRank][5] = tempBoard[oldRank][7];
                tempBoard[oldRank][7] = null;
            } else if (newFile === 2) {
                tempBoard[newRank][3] = tempBoard[oldRank][0];
                tempBoard[oldRank][0] = null;
            }
        }

        // Find where our king is
        let kingPos = {...this.#kingLocation[this.#turn]};
        if (tempBoard[newRank][newFile].type === Piece.Type.KING) {
            kingPos.rank = newRank;
            kingPos.file = newFile;
        }

        return(this.isPlayerInCheck(this.#turn, tempBoard, kingPos));
    }

    /**
     * Changes the turn of the player, and initiates the new turn by checking for any game-ending conditions
     */
    #changeTurn() {
        // Change whose turn it is
        if (this.#turn === Piece.Colour.WHITE) {
            this.#turn = Piece.Colour.BLACK;
        } else {
            this.#turn = Piece.Colour.WHITE;
        }

        // TODO: Check for checkmate/draw
    }
}
