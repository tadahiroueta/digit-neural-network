# Repository Name
***Short description of the repository***

[Visit Website](https://digit.tadahiroueta.com) · [Built With](#built-with) · [Features](#features) · [Usage](#usage)

## Built With
<!-- Find more shield at https://github.com/Ileriayo/markdown-badges?tab=readme-ov-file -->
- ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
- ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
- ![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
- ![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)
- ![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
- ![Netlify](https://img.shields.io/badge/netlify-%23000000.svg?style=for-the-badge&logo=netlify&logoColor=#00C7B7)
- ![SASS](https://img.shields.io/badge/SASS-hotpink.svg?style=for-the-badge&logo=SASS&logoColor=white)

## Features
- Machine-learning AI made to recognise digits
  - I programmed the neural network from scratch without any ML libraries
      > I wanted to really understand how it works from the inside and out

  - It was trained from this [sample](https://github.com/mnielsen/neural-networks-and-deep-learning)
      > Disclaimer: the AI sucks.
      >
      > It was either because it got overfitted to the training data or because the training data and the grid input were made with different UIs.

  ![weights](https://github.com/tadahiroueta/digit-neural-network/blob/master/samples/weights.png)

  > Raw JSON data on weights used by the network

- Input grid to draw digits with cursor
  - Based on (React) [Konva](https://konvajs.org/docs/react/Intro.html)'s geometric components
      > Not accessible for mobile devices; touch screens are too hard

  <br>
  <img src="https://github.com/tadahiroueta/digit-neural-network/blob/master/samples/input-grid.png" alt="input-grid" width="50%" />
  <br>

- Dynamic preview of the neural network
  - Activate nodes and stronger weights are displayed brighter with [Konva](https://konvajs.org/docs/react/Intro.html) 

  <br>
  <img src="https://github.com/tadahiroueta/digit-neural-network/blob/master/samples/neural-network.png" alt="neural-network" width="50%" />
  <br>

## Usage

![full-screen](https://github.com/tadahiroueta/digit-neural-network/blob/master/samples/full-screen.png)

1. Visit the [website](https://digit.tadahiroueta.com)
2. Use your cursor to draw a single-digit number on the grid
3. Watch the network guess the number (usually incorrectly)