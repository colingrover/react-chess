# Browser-Based Chess Games
Intend on having at least a playable chess game, ideally with some sort of engine to play against

Writing this to learn more react :)

## Build
### Dev Image
```
docker compose build dev
```

### Production Image
I haven't actually messed w/ this one yet, just using from [here](https://www.docker.com/blog/how-to-dockerize-react-app/)
```
docker build -t react-chess -f Dockerfile .
```

## Run
### Dev Image
```
docker compose up dev --watch
```

### Production Image
I haven't actually messed w/ this one yet, just using from [here](https://www.docker.com/blog/how-to-dockerize-react-app/)
```
docker compose up prod
```
