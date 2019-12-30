// This file includes functions for creating a new generation
// of landers.

// Create the next generation
function nextGeneration(thisGen) {
  // Normalize the fitness values 0-1
  normalizeFitness(thisGen);
  // Generate a new set of birds
  activeLanders = generate(thisGen);
  // Copy those birds to another array
  newGen = activeLanders.slice();
  return newGen;
}

// Normalize the fitness of all birds
function normalizeFitness(landers) {

  // Add up all the scores
  let sum = 0;
  for (let i = 0; i < landers.length; i++) {
    sum += landers[i].score;
  }
  // Divide by the sum
  for (let i = 0; i < landers.length; i++) {
    landers[i].fitness = landers[i].score / sum;
  }
}

// Generate a new population of birds
function generate(oldLanders) {
  let newLanders = [];
  let i = 0;
  for (i = 0; i < 20; i++) {
    newLanders[i] = bestlander[0].copy();
    newLanders[i].highlight();
  }
  for (i = i; i < agents; i++) {
    // Select a bird based on fitness
    let lander = poolSelection(oldLanders);
    newLanders[i] = lander;
  }
  return newLanders;
}

// An algorithm for picking one lander from an array
// based on fitness
function poolSelection(landers) {
  // Start at 0
  let index = 0;

  // Pick a random number between 0 and 1
  let r = random(1);

  // Keep subtracting probabilities until you get less than zero
  // Higher probabilities will be more likely to be fixed since they will
  // subtract a larger number towards zero
  while (r > 0) {
    r -= landers[index].fitness;
    // And move on to the next
    index += 1;
  }

  // Go back one
  index -= 1;

  // Make sure it's a copy!
  // (this includes mutation)
  return landers[index].copy();
}
