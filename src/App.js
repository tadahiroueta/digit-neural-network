import { useState, useRef } from 'react';
import { Stage, Layer, Circle, Line, Text, Rect } from 'react-konva';
import { isMobile } from 'react-device-detect';
import NeuralNetwork from './NeuralNetwork';

const circles = require('./data/circles.json');
const dots = require('./data/dots.json');
const digits = require('./data/digits.json');
const weights = require('./data/weights.json');
const biases = require('./data/biases.json');

const WIDTH = window.innerWidth;
const SQUARE_SIZE = WIDTH / 5;
const NEURON_RADIUS = SQUARE_SIZE / 55;
const PIXEL_SIZE = SQUARE_SIZE / 28;
const PIXEL_RADIUS = .5;
const DRAW_STROKE_WIDTH = .35;
const FILLER_SPACING = 1

const network = new NeuralNetwork(weights, biases);

const distance = (pointA, pointB) => Math.sqrt(Math.pow(pointA.x - pointB.x, 2) + Math.pow(pointA.y - pointB.y, 2));

export default function App() {
  // as a matrix
  const [input, setInput] = useState(Array(28).fill(0).map(() => Array(28).fill(0))); 
  const [activation, setActivation] = useState(circles.map(column => column.map(() => 0)));
  const [output, setOutput] = useState("?");

  const isDrawing = useRef(false);
  const lastPoint = useRef({});

  /** Lets the network run */
  const guess = () => {
    console.log(input.flat())
    setOutput(network.guess(input.flat())) // run network
    setActivation(network.activations) // update activation
  }

  /** 
   * Makes some pixels brigther
   * 
   * @param {number[][]} input state matrix
   * @param {Object} coordinates of point { x, y }
   * @returns {number[][]} unupdated input state matrix
   */
  const drawPoint = (input, { x: x0, y: y0 }) => {
    for (let y = Math.max(Math.floor(y0 - PIXEL_RADIUS), 0); y <= Math.min(Math.ceil(y0 + PIXEL_RADIUS), 27); y++) 
      for (let x = Math.max(Math.floor(x0 - PIXEL_RADIUS), 0); x <= Math.min(Math.ceil(x0 + PIXEL_RADIUS), 27); x++)
        input[y][x] = Math.min(input[y][x] + DRAW_STROKE_WIDTH / distance({ x, y }, { x: x0, y: y0 }), 1);
      
    return input
  }

  /**
   * @param {Object} e element containing coordinates, deep in the object
   */
  const drawLine = e => {
    const { x, y } = e.target.getStage().getPointerPosition();
    const current = { x: x / PIXEL_SIZE, y: y / PIXEL_SIZE } // to fit the grid
    // draw current point no matter what
    let localInput = drawPoint(input.map(row => row.map(pixel => pixel)), current);

    if (isDrawing.current) {    
      // draw filler points
      const last = lastPoint.current;
      const fullMagnetude = distance(current, last);
      const vector = { x: current.x - last.x, y: current.y - last.y };
      const nPoints = Math.floor(fullMagnetude / FILLER_SPACING);

      for (let i = 1; i < nPoints; i++) { // skip the first and last point
        const magnetudeFactor = i / nPoints;
        localInput = drawPoint(localInput, { x: last.x + vector.x * magnetudeFactor, y: last.y + vector.y * magnetudeFactor })
    }}

    // update last point
    lastPoint.current = current;
    setInput(localInput);
  }

  /**
   * Considers start of a drawn line
   * 
   * @param {Object} e 
   */
  const handleMouseDown = e => {
    drawLine(e);
    isDrawing.current = true;
  };

  /**
   * Considers continuation of a drawn line
   * 
   * @param {Object} e 
   */
  const handleMouseMove = e => {if (isDrawing.current) drawLine(e)};

  /** Considers end of a drawn line */
  const handleMouseUp = () => {
    if (isDrawing.current) guess()
    isDrawing.current = false
  }

  /** Clears input */
  const handleClick = () => { 
    setInput(Array(28).fill(0).map(() => Array(28).fill(0)))
    setActivation(circles.map(column => column.map(() => 0)))
    setOutput("?")
  }

  return isMobile ? 
    <p className='Mobile'>Sorry, this app is not available on <span>mobile devices</span>.</p> : (
    <div className="App">
      <header>
        <h1><span>Digit</span> Neural Network</h1>
      </header>

      <main>
        <div className='Input'>
          <Stage className="Canvas" width={SQUARE_SIZE} height={SQUARE_SIZE} onMouseDown={handleMouseDown} onMousemove={handleMouseMove} onMouseup={handleMouseUp}>
            <Layer>  
              {/* Pixels */}
              {input.map((row, y) => row.map((pixel, x) => {
                const shade = pixel * 255
                return <Rect key={x} x={x * PIXEL_SIZE} y={y * PIXEL_SIZE} width={PIXEL_SIZE} height={PIXEL_SIZE} fill={`rgb(${shade}, ${shade}, ${shade})`} />
              }))}
              
              {/* Grid */}
              {Array(29).fill(0).map((_, i) => (<Line key={i} points={[i * PIXEL_SIZE, 0, i * PIXEL_SIZE, SQUARE_SIZE]} stroke="grey" strokeWidth={1} />))}
              {Array(29).fill(0).map((_, i) => (<Line  key={i} points={[0, i * PIXEL_SIZE, SQUARE_SIZE, i * PIXEL_SIZE]} stroke="grey" strokeWidth={1} />))}
            </Layer>
          </Stage>
        </div>

        <Stage className='Network' width={SQUARE_SIZE} height={SQUARE_SIZE}>
          <Layer>
            {/* weights */}
            {circles.map((column, i, circles) =>
              i > 0 ? column.map((to, k) => 
                circles[i - 1].map((from, j) => {
                  const shade = weights[i][k][j] * 255 * (i === 1 ? 10 : 1); // the first layer of weights dimmer
                  return <Line key={j} points={[to.x * SQUARE_SIZE, to.y * SQUARE_SIZE, from.x * SQUARE_SIZE, from.y * SQUARE_SIZE]} stroke={`rgb(${shade}, ${shade}, ${shade})`} strokeWidth={.5} />
            })) : [])}

            {/* neurons */}
            {circles.map((column, superI) => 
              column.map(({ x, y }, subI) => {
                const shade = activation[superI][subI] * 255;
                return <Circle key={subI} x={x * SQUARE_SIZE} y={y * SQUARE_SIZE} radius={NEURON_RADIUS} stroke={superI === 3 && subI === output ? "yellow" : "white"} strokeWidth={.75} fill={superI === 3 && subI === output ? "yellow" : `rgb(${shade}, ${shade}, ${shade})`} />
            }))}
            
            {/* dots */}
            {dots.map(({ x, y }, i) => <Circle key={i} x={x * SQUARE_SIZE} y={y * SQUARE_SIZE} radius={1} fill="white" />)}

            {/* digits */}
            {digits.map(({ x, y }, i) => <Text key={i} x={x * SQUARE_SIZE} y={(y - .015) * SQUARE_SIZE} text={i} fontSize={NEURON_RADIUS * 2} fill="white" fontFamily='Fairplay Display'/>)}
          </Layer>
        </Stage>

        <div className='Output'>
          <button onClick={handleClick}>
            <h3>←</h3>
          </button>
          <h3>&emsp;{">>>"}&emsp;<span>{output}</span></h3>
        </div>
      </main>

      <footer>
        <p>by Tadahiro Ueta&emsp;&emsp;&emsp;|&emsp;&emsp;&emsp;tadahiroueta@gmail.com&emsp;&emsp;&emsp;|&emsp;&emsp;&emsp;big thanks to <span>3Blue1Brown</span> for his videos</p>
      </footer>
    </div>
  );
}