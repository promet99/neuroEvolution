// Mutation function to be passed into Vehicle's brain
function mutate(x) {
  if (random(1) < 0.05) {
    let offset = randomGaussian() * 0.3;
    let newx = x + offset;
    return newx;
  } else {
    return x;
  }
}


// This is the class for each Vehicle
class Lander {
  // A Lander can be from a "brain" (Neural Network)
  constructor(brain) {

    // All the physics stuff
    this.acceleration = createVector(0, 0);
    this.velocity = createVector(0, 0);
    this.position = createVector(300, 50);

    this.downThrust = false;
    this.leftThrust = false;
    this.rightThrust = false;
    this.maxThrust = 1;

    this.angle = 0;

    // This indicates how well it is doing
    this.score = 0;
    this.fitness = 0;

    this.flying = true;
    this.success = false;
    this.elite = false;

    this.landerColor = color(120, 120, 120);
    this.landerColor.setAlpha(100);

    // If a brain is passed via constructor copy it
    if (brain instanceof NeuralNetwork) {
      this.brain = brain.copy();
      this.brain.mutate(mutate);
    } else {
      this.brain = new NeuralNetwork(5, 9, 3);
    }

    // Health keeps Lander alive. Decreases by time
    this.maxhealth = 300;
    this.health = 300;
  }

  newflight() {
    this.acceleration = createVector(0, 0);
    this.velocity = createVector(0, 0);
    //this.position = createVector(40, 40);
    this.position = createVector(300, 50);

    this.downThrust = false;
    this.leftThrust = false;
    this.rightThrust = false;
    this.angle = 0;


    this.flying = true;
    this.success = false;
    this.health = this.maxhealth;
  }

  // Return true if Lands
  checkSuccess() {
    if (this.position.x > goal && this.position.x < goal_end && this.position.y > 290 && this.position.y < 300) {
      this.flying = false;
      this.success = true;
    }
  }

  // Return true if lander is broken
  checkDead() {
    if (this.health < 0 || this.position.x > width || this.position.x < 0 || this.position.y < 0 || this.position.y > 300) {
      this.flying = false;
    }
  }

  copy() {
    return new Lander(this.brain);
  }

  think(goal_m) {
    let inputs = [];
    inputs[0] = this.position.y / height;
    inputs[1] = map(this.velocity.x, -5, 5, 0, 1);
    inputs[2] = map(this.velocity.y, 0, 10, 0, 1);
    inputs[3] = map(goal_mid, 0, width, 0, 1); //  goal-x-mid
    inputs[4] = map(goal_mid - this.position.x, -640, 640, 0, 1);

    // Get the outputs from the network
    let action = this.brain.predict(inputs);

    // OutPut (0~1)
    this.downThrust = (action[0] > 0.5); // grav = 0.1 , 0.2
    this.leftThrust = (action[1] > 0.5); // 0.1
    this.rightThrust = (action[2] > 0.5);
  }

  // Add force to acceleration
  thrust() {
    var thrust = createVector(0, 0);
    thrust.rotate(this.angle)
    if (this.leftThrust) {
      //thrust.x += 0.06;
      thrust.y += 0.1;
      this.angle += 2;
    }
    if (this.rightThrust) {
      //thrust.x -= 0.06;
      thrust.y += 0.1;
      this.angle -= 2;
    }
    if (this.downThrust) {
      thrust.y -= 0.2;
    }
    this.acceleration.add(thrust);
  }

  // Called each time step
  update() {
    this.velocity.y += gravity;

    // Update velocity
    this.velocity.add(this.acceleration);
    // Update position
    this.position.add(this.velocity);
    // Reset acceleration to 0 each cycle
    this.acceleration.mult(0);

    this.health -= 1;
  }

  highlight() {
    this.elite = true;
    this.landerColor = color(0, 240, 0);
    //this.landerColor.setAlpha(100);
  }
  // Display the bird
  show() {
    translate(this.position.x, this.position.y);
    rotate(radians(this.angle));
    fill(this.landerColor);
    triangle(0, -10, -10, 0, 10, 0);

    this.firecolor = color(200, 0, 0)
    this.firecolor.setAlpha(200);
    if (this.elite == true) {
      noFill();
      stroke(255, 204, 0);
      ellipse(0, 0, 15, 15);
      stroke(0);
    }

    fill(this.firecolor);
    if (this.leftThrust) {
      ellipse(-10, 4, 4, 8);
    };
    if (this.rightThrust) {
      ellipse(10, 4, 4, 8);
    };
    if (this.downThrust) {
      ellipse(0, 4, 4, 8);
    };
    rotate(radians(-this.angle));
    translate(-this.position.x, -this.position.y);
  }

  // score this Lander once its dead/success
  setscore() {
    let stageScore = 0;
    let xscore = 0;
    let yscore = 0
    // how close from goal_mid in x
    if (this.position.x < goal_mid) {
      if (this.position.x < 0) {
        this.position.x = 0
      }
      xscore = map(this.position.x, 0, goal_mid, 0, 10);
    } else {
      if (this.position.x > 640) {
        this.position.x = 640
      }
      xscore = map(this.position.x, goal_mid, 640, 10, 0);
    }

    // this.position.y
    if (this.position.y < 0) {
      this.position.y = 0
    }
    if (this.position.y > 300) {
      this.position.y = 300
    }
    yscore = map(this.position.y, 0, 360, 0, 6);

    // this.score += Math.floor(this.health / 50)
    stageScore = Math.floor((pow(yscore, 3) + pow(xscore, 3)) / 30);

    this.score = Math.floor((this.score + stageScore) / 1.8);
  }


  fly() {
    this.think();
    this.thrust();
    this.update();
    // this.show();
    this.checkSuccess();
    this.checkDead();
  }

}
