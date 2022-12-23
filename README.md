# TTT (Todoist to Tana)

> ⚠️ WARNING: APIs use in this project is not stable


Simply pull tasks from Todoist to Tana.

## Requirement

- Node 16+


## Install

1. Download or clone this project
2. `npm run install:ttt`


## Usage 

Set todoist token
```
ttt config --todoist-token <token>
```


Pull today's tasks
```
ttt pull --tana-token <token>
```


###  Set default tana token

```
ttt config --tana-token <token>
```


### Pull other tasks
```
ttt pull --filter <todoist filter>
```
