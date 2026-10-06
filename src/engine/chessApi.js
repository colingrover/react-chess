const CHESS_API_URL = 'https://chess-api.com/v1';

export async function getChessAnalysis(data = {}) {
    const response = await fetch(CHESS_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error(`Chess API request failed (${response.status}).`);
    }

    const result = await response.json();

    if (!result || typeof result !== 'object') {
        throw new Error('Chess API returned an invalid response.');
    }

    if (result.type === 'error') {
        throw new Error(`Chess API request failed (${result.text}).`);
    }

    return result;
}