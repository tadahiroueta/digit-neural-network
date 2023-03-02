// const fs = require('fs');
// const cliProgress = require("cli-progress");

const AREA = 28 * 28
// const FILENAMES = {
//     INPUT: './data/data_1000.json',
//     WEIGHTS: './src/data/weights.json',
//     BIASES: './src/data/biases.json'
// }
const LEARNING_CONSTANT = .2

/**
 * @param {number} size 
 * @param value -- must be a function
 * @returns {number[]}
 */
const vector = (size, value) => new Array(size).fill().map(value)

/**
 * @param {number} z
 * @returns {number} (0, 1)
 */
const sigmoid = z => 1 / (1 + Math.exp(-z))

/**
 * @param {number} z
 * @returns {number} (0, 1)
 */
const sigmoidPrime = z => sigmoid(z) * (1 - sigmoid(z))


export default class NeuralNetwork {
    /**
     * Give arguments if the network is already trained
     * 
     * @param {?number[][][]} weights 
     * @param {?number[][]} biases 
     */
    constructor(weights=null, biases=null) {
        this.weights = weights ? weights : [
            null,
            vector(16, () => vector(AREA, () => Math.random() / 10)),
            vector(16, () => vector(16, () => Math.random() / 10)),
            vector(10, () => vector(16, () => Math.random() / 10))
        ]

        this.biases = biases ? biases : [
            null,
            vector(16, () => Math.random() / 10),
            vector(16, () => Math.random() / 10),
            vector(10, () => Math.random() / 10)
        ]

        this.activations = vector(4, () => [])
        this.z = vector(4, () => []) // z = w * a + b; I don't know the name for this
    }

    /** 
     * Finds activation value for specified layer
     * 
     * @param {number} layer
     */
    activate(layer) {
        this.z[layer] = this.weights[layer].map(
            (weights, to) => weights.reduce(
                (sum, weight, from) => sum + weight * this.activations[layer - 1][from],
                0
            ) + this.biases[layer][to]
        )

        this.activations[layer] = this.z[layer].map(sigmoid)

        if (layer === 3) {
            const sum = this.activations[layer].reduce((sum, activation) => sum + activation)
            this.activations[layer] = this.activations[layer].map(activation => activation / sum)
    }}

    /**
     * Let the network work it out
     * 
     * @param {number[AREA]} x
     * @returns {number[10]} output layer
     */
    propagateForward(x) {
        this.activations[0] = x
        for (let layer = 1; layer < 4; layer++) this.activate(layer)
        return this.activations[3]
    }

    /**
     * @param {number[AREA]} x
     * @returns {number} guess
     */
    guess(x) {
        const outputLayer = this.propagateForward(x)
        return outputLayer.indexOf(Math.max(...outputLayer))
    }

    /**
     * Propagates back to find derivatives
     * 
     * @param {number[10]} y correct answer
     * @returns {Object} derivatives - { weightDerivatives, biasDerivatives }
     */
    propagateBack(y) {
        const activationDerivatives = vector(4, () => [])
        const weightDerivatives = vector(4, () => [])
        const biasDerivatives = vector(4, () => [])
        const weights = this.weights

        for (let layer = 3; layer >= 1; layer--) {

            // activations
            activationDerivatives[layer] = layer === 3 ? 
                this.activations[layer].map(
                    (activation, i) => 2 * (activation - y[i])
                ) : Array(16).fill().map(
                    (_, k) => Array(this.activations[layer + 1].length).fill().reduce(
                        (sum, _, j) => sum + weights[layer + 1][j][k] * biasDerivatives[layer + 1][j], 
                        0
                ))
            
            // biases
            biasDerivatives[layer] = activationDerivatives[layer].map(
                (derivative, i) => derivative * sigmoidPrime(this.z[layer][i])
            )
            
            // weights
            weightDerivatives[layer] = biasDerivatives[layer].map(
                (derivative, i) => this.activations[layer - 1].map(
                    activation => derivative * activation
        ))}

        return { weightDerivatives, biasDerivatives }
    }

    /**
     * Tweaks the network to make it more accurate, like finding the minimum
     *  
     * @param {Object} derivatives { weightDerivatives, biasDerivatives }
     */
    punishment({ weightDerivatives, biasDerivatives }) {
        this.weights = this.weights.map(
            (weights, layer) => layer === 0 ? null : weights.map(
                (weights, to) => weights.map(
                    (weight, from) => weight - weightDerivatives[layer][to][from] * LEARNING_CONSTANT
        )))
        this.biases = this.biases.map(
            (biases, layer) => layer === 0 ? null : biases.map(
                (bias, to) => bias - biasDerivatives[layer][to] * LEARNING_CONSTANT
    ))}

    /**
     * @param {boolean[100]} last1000 last 100 successfulness of guesses
     * @returns {number} accuracy [0, 1]
     */
    accuracy(last1000) {return last1000.reduce((sum, success) => sum + success) / 1000}

    /**
     * Trains the network through positive punishment. It lets the network guess a batch of training data and then corrects it and makes changes towards the correct answer. If it runs out of training data, it will start over.
     * 
     * @param {number} target accuracy of the network [0, 1) 
     */
    // operantConditioning(target) {
    //     const { training } = require(FILENAMES.INPUT)
    //     const last1000 = []
    //     const bar = new cliProgress.SingleBar({ format: '{bar} {percentage}% accuracy' }, cliProgress.Presets.shades_classic)
    //     bar.start(100, 0)
        

    //     for (let i = 0; true; i = (i + 1) % training.length) { // forever for loop
    //         const { x, y } = training[i]
    //         const isCorrect = this.guess(x) === y.indexOf(1)
            
    //         this.punishment(this.propagateBack(y))

    //         last1000[i] = isCorrect // overwriting
    //         if (i === 999) {
    //             const accuracy = this.accuracy(last1000)
    //             bar.update(accuracy * 100)
                
    //             if (accuracy >= target) return
    // }}}

    /** Saves weights and biases */
    // save() {
    //     fs.writeFileSync(FILENAMES.BIASES, JSON.stringify(this.biases))
    //     fs.writeFileSync(FILENAMES.WEIGHTS, JSON.stringify(this.weights))
    //     console.log("Network saved.")
    // }
}