# Extending GICS to 3D

## Installation

Requires Node v12+ (tested with Node v14)  
Install, clone, run `npm install`  
Edit file `app/gics.txt` (for now)  
Run `npm start`

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

## Planning

### MVP

1. ~~Working pipeline: input, storage, output (SVG)~~
2. Basic primitives: plane, ~~line, point, segment~~, cube, parallelogram, cone, cyllinder, sphere
3. Constructions: heights, apotems, crossings, projections
4. Solve visibility problem and dotted lines
5. Other 3D primitives
6. Marks, hatchings, arrows, angles
7. 2D primitives port
8. Demo/Clientside

### Nice to have

1. Complete constructor options for all primitives
2. Move camera
3. Styling options
4. Projections - perspective
5. Output - canvas
6. Output - Gics2D

### Text

1. Other solutions
2. Motivation & choices
3. Challenges & solutions
4. Demo code - selection of geometric problems
5. Future extensions

