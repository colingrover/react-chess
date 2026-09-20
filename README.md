# Browser-Based Chess Games
Intend on having at least a playable chess game, ideally with some sort of engine to play against

Writing this to learn more react :)

# Build
## Dev Image
```
docker build -t react-chess-dev -f Dockerfile.dev .
```

## Production Image
I haven't actually messed w/ this one yet, just using from [here](https://www.docker.com/blog/how-to-dockerize-react-app/)
```
docker build -t react-chess -f Dockerfile .
```

# Run
## Dev Image
```
docker run -p 5173:5173 react-chess-dev
```

## Production Image
I haven't actually messed w/ this one yet, just using from [here](https://www.docker.com/blog/how-to-dockerize-react-app/)
```
docker run -p 30000:30000 react-chess
```
