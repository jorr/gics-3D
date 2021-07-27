# Extending GICS to 3D

## Installation

Requires Node v12+ (tested with Node v14)  
Install, clone, run `npm install`  

OPTION 1: 
Edit file `app/gics.txt`
Run `npm start`
Load `gics.svg` in your browser for the result

OPTION 2:
Run `npm run server`
Load `localhost:6105` in your browser
Experiment

## Environment

Vanilla JS client - for demo purposes  
Node.js server w/ Express; Single endpoint

## Modules

1. Input
   1. Server w/ API
   2. Parser
   3. Commands interpreter

2. Storage & Scene
   1. Data structure
   2. Recall
   3. Camera & Canvas operations
   4. Transformations

3. Output
   1. Calculate visibility
   2. Projections
   3. Generate 2D output


