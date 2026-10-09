// Edit the runnable Python files in games/. Each `find` fragment must occur once.
// Answers are short expressions from the taught topics; Pygame scaffolding is supplied.
function blank(id, find, answer, prompt, hint, distractors, accept = []) {
  return { id, find, answer, prompt, hint, options: [answer, ...distractors], accept };
}
export const GAMES = [
  {
    id:'catch', title:'Catch the Coin', genre:'FIRST STEPS', colour:'#b5fb68', file:'01-catch-the-coin.py',
    description:'Move your catcher. Chase the gold. Ten coins to victory.', tease:'Your first build. Catch falling coins and get on the board.',
    controls:'← → or A / D to move · R to replay', features:['Movement','Scoring'],
    briefing:'Catch 10 falling coins. A missed coin simply falls again — keep going!',
    blanks:[
      blank('speed','player_speed = 6','6','Set the player’s speed to 6.','An assignment puts a value on the right of =.',['0','-6']),
      blank('start','score = 0\nwon','0','Start the score at zero.','Before any coins are caught, the player has no points.',['1','10']),
      blank('right','player.x = player.x + player_speed','player.x + player_speed','Move the player right by adding the speed.','Increasing the x coordinate moves the player to the right.',['player.x - player_speed','player.x * player_speed'],['player_speed + player.x']),
      blank('point','score = score + 1','score + 1','Add one point when a coin is caught.','Use the old score and add one before assigning it back.',['score - 1','1'],['1 + score']),
      blank('win','if score >= 10:','>=','Win when the score is 10 or more.','The comparison must include exactly 10 as well as higher values.',['>','<='])
    ]
  },
  {
    id:'dodge',title:'Dodge!',genre:'SURVIVAL',colour:'#bba0ff',file:'02-dodge.py',
    description:'Three falling threats. One chance to stay in the game.',tease:'Avoid a storm of falling blocks. Complete Catch the Coin to unlock.',
    controls:'← → or A / D to move · R to restart',features:['Randomness','Game over'],
    briefing:'Stay alive for as long as you can. The score counts full seconds survived.',
    blanks:[
      blank('fall','fall_speed = 4','4','Set the falling speed to 4.','Use a positive value so the obstacles move down.',['-4','0']),
      blank('start','score = 0\nframes','0','Start the score at zero.','No time has been survived at the start.',['60','1']),
      blank('left','player.x = player.x - player_speed','player.x - player_speed','Move left by subtracting the speed.','A smaller x coordinate is farther left.',['player.x + player_speed','player_speed - player.x']),
      blank('down','obstacle.y = obstacle.y + fall_speed','obstacle.y + fall_speed','Make the obstacle fall down the screen.','Larger y coordinates are farther down the window.',['obstacle.y - fall_speed','fall_speed - obstacle.y'],['fall_speed + obstacle.y']),
      blank('edge','if obstacle.y > 480:','>','Reset an obstacle after its y coordinate passes 480.','It should reset below the bottom, not while it is still on screen.',['<','==']),
      blank('random','obstacle.x = random.randint(0, 602)','random.randint(0, 602)','Pick a random whole-number x coordinate from 0 to 602.','The provided random module has a randint function with two inclusive endpoints.',['random.randint(0, 640)','random.randint(602, 0)'])
    ]
  },
  {
    id:'blaster',title:'Target Blaster',genre:'AIM & FIRE',colour:'#68ddf5',file:'03-target-blaster.py',
    description:'Line up the shot. Take out twelve targets.',tease:'Build a blaster and chase the bullseye. Complete Dodge! to unlock.',
    controls:'← → or A / D to move · Space to shoot · R to replay',features:['Projectiles','Collision'],
    briefing:'Fire at the targets. Each hit places that target somewhere new. Get 12 hits to win.',
    blanks:[
      blank('start','score = 0\ncooldown','0','Start the score at zero.','Targets hit before the game starts: zero.',['12','1']),
      blank('cooldown','cooldown = cooldown - 1','cooldown - 1','Reduce the firing cooldown by one each frame.','The cooldown needs to count down towards zero.',['cooldown + 1','cooldown * 1']),
      blank('ready','cooldown == 0:','==','Check whether the cooldown equals zero.','Comparison uses two equals signs in Python.',['=','<']),
      blank('up','bullet.y = bullet.y - 8','bullet.y - 8','Move each bullet upwards by 8.','Subtracting from y moves upwards.',['bullet.y + 8','8 - bullet.y']),
      blank('hit','score = score + 1','score + 1','Increase the hit count by one.','Keep the old total and add one.',['score - 1','score + 12'],['1 + score']),
      blank('win','if score >= 12:','>=','Win after at least 12 hits.','Include the target value as well as anything above it.',['>','<='])
    ]
  },
  {
    id:'pong',title:'Pong',genre:'HEAD TO HEAD',colour:'#71efb7',file:'04-pong.py',
    description:'You versus the computer. First to five takes the match.',tease:'Face a computer opponent. Complete Target Blaster to unlock.',
    controls:'↑ ↓ or W / S to move · R to restart',features:['Bouncing ball','Computer opponent'],
    briefing:'Move the left paddle to return the ball. The computer plays on the right. First to 5 wins.',
    blanks:[
      blank('speed','ball_x_speed = 5\nball_y_speed','5','Set the horizontal ball speed to 5.','A positive x speed sends the ball right.',['-5','0']),
      blank('up','player.y = player.y - 6','player.y - 6','Move the paddle upwards by 6.','Up means a smaller y coordinate.',['player.y + 6','6 - player.y']),
      blank('computer','computer.y = computer.y + 3','computer.y + 3','Move the computer paddle down by 3.','Increase y to follow a ball below the paddle.',['computer.y - 3','computer.y * 3'],['3 + computer.y']),
      blank('bounce','ball_y_speed = -ball_y_speed\n        if ball.bottom','-ball_y_speed','Reverse the ball’s vertical direction at the top wall.','Negating a speed swaps its sign.',['ball_y_speed','0']),
      blank('computer-point','computer_score = computer_score + 1','computer_score + 1','Award the computer one point.','Add to the computer’s score, not the player’s.',['player_score + 1','computer_score - 1'],['1 + computer_score']),
      blank('player-point','player_score = player_score + 1','player_score + 1','Award the player one point.','Use the player’s existing score plus one.',['computer_score + 1','player_score - 1'],['1 + player_score']),
      blank('result','if player_score >= 5:\n            message','>=','Show the player’s win message for a score of 5 or more.','Exactly 5 must qualify.',['>','<'])
    ]
  },
  {
    id:'breakout',title:'Breakout',genre:'BRICK BREAKER',colour:'#f0a0cd',file:'05-breakout.py',
    description:'A bouncing ball. A wall of bricks. Make every hit count.',tease:'Destroy an entire wall of bricks. Complete Pong to unlock.',
    controls:'← → or A / D to move · R to restart',features:['Destructible bricks','Three lives'],
    briefing:'Keep the ball above the paddle and smash all 21 bricks. Each brick earns 10 points.',
    blanks:[
      blank('lives','lives = 3\ngame_over','3','Give the player three lives at the start.','This is the initial value, before any ball is missed.',['0','1']),
      blank('right','paddle.x = paddle.x + 7','paddle.x + 7','Move the paddle right by 7.','Increasing x moves to the right.',['paddle.x - 7','paddle.x * 7'],['7 + paddle.x']),
      blank('x','ball.x = ball.x + ball_x_speed','ball.x + ball_x_speed','Update the ball’s horizontal position using its speed.','Add the current horizontal speed, which may be positive or negative.',['ball.x - ball_y_speed','ball_x_speed'],['ball_x_speed + ball.x']),
      blank('point','score = score + 10','score + 10','Award 10 points for a brick.','Keep the existing score and add ten.',['score + 1','10'],['10 + score']),
      blank('miss','lives = lives - 1','lives - 1','Remove one life when the ball is missed.','Subtract one from the current number of lives.',['lives + 1','1 - lives']),
      blank('over','if lives <= 0:','<=','End the game when no lives remain.','Zero or fewer means the player is out of lives.',['<','>=']),
      blank('bricks','if len(bricks) == 0:','len(bricks)','Use a predefined function to count the remaining bricks.','Python’s length function works on the supplied list.',['len(ball)','len(bricks) + 1'])
    ]
  },
  {
    id:'sentinel',title:'Star Sentinel',genre:'SPACE DEFENCE',colour:'#8aacff',file:'06-star-sentinel.py',
    description:'An incoming drone fleet. Defend your sector.',tease:'Clear a descending fleet of drones. Complete Breakout to unlock.',
    controls:'← → or A / D to move · Space to shoot · R to restart',features:['Enemy fleet','Lives & scoring'],
    briefing:'Shoot all 18 drones before the fleet reaches your row. Every drone that reaches you costs a life.',
    blanks:[
      blank('lives','lives = 3\ngame_over','3','Start with three lives.','This is a simple assignment of the initial health.',['0','18']),
      blank('left','player.x = player.x - 6','player.x - 6','Move the ship left by 6.','Reduce x for leftward motion.',['player.x + 6','6 - player.x']),
      blank('ready','cooldown == 0:','==','Allow firing when the cooldown equals zero.','Test equality, rather than assigning zero.',['=','<']),
      blank('up','bullet.y = bullet.y - 8','bullet.y - 8','Send each bullet upwards by 8.','Smaller y values are higher on the screen.',['bullet.y + 8','8 - bullet.y']),
      blank('reverse','enemy_speed = -enemy_speed','-enemy_speed','Reverse the fleet’s horizontal speed at an edge.','Use the negative of the old speed to swap its direction.',['enemy_speed','0']),
      blank('score','score = score + 10','score + 10','Award 10 points for destroying a drone.','Add ten to the existing score.',['score - 10','score + 1'],['10 + score']),
      blank('loss','lives = lives - 1','lives - 1','Lose one life when a drone reaches your row.','Subtract one from the existing lives value.',['lives + 1','0']),
      blank('end','if lives <= 0:','<=','End the defence when no lives remain.','Include zero as well as any value below zero.',['<','>='])
    ]
  },
  {
    id:'skyline',title:'Skyline Sprint',genre:'PLATFORM ADVENTURE',colour:'#ffc66b',file:'07-skyline-sprint.py',
    description:'Jump the rooftops. Collect the gems. Reach the exit.',tease:'Add gravity, jumping and rooftop hazards. Complete Star Sentinel to unlock.',
    controls:'← → or A / D to run · Space / ↑ / W to jump · R to restart',features:['Gravity & jumping','Collectibles'],
    briefing:'Collect four gems, then reach the green door. Platforms can be jumped through from below. Watch the spikes on the ground.',
    blanks:[
      blank('gravity','gravity = 0.55','0.55','Set gravity to 0.55.','Gravity is a positive decimal: it increases downward speed.',['-0.55','0']),
      blank('right','player.x = player.x + 5','player.x + 5','Run right by adding 5 to x.','Increasing x moves right.',['player.x - 5','player.x * 5'],['5 + player.x']),
      blank('jump','vertical_speed = -11','-11','Give a jump an upward speed of negative 11.','An upward jump starts with a negative vertical speed.',['11','0']),
      blank('fall','vertical_speed = vertical_speed + gravity','vertical_speed + gravity','Add gravity to the vertical speed each frame.','Gravity gradually turns an upward jump into a downward fall.',['vertical_speed - gravity','gravity'],['gravity + vertical_speed']),
      blank('gem','score = score + 1','score + 1','Count one more collected gem.','The new total is the old total plus one.',['score + 4','1'],['1 + score']),
      blank('hazard','lives = lives - 1','lives - 1','Remove one life for touching a spike.','Use subtraction to decrease the lives value.',['lives + 1','1 - lives']),
      blank('over','if lives <= 0:','<=','End the game when there are no lives left.','Exactly zero needs to count as out of lives.',['<','>']),
      blank('gems','if score == 4:','==','Only check the exit after exactly four gems are collected.','Use Python’s equality comparison.',['=','<'])
    ]
  },
  {
    id:'relic',title:'Relic Run',genre:'THE FINAL BUILD',colour:'#e2db8c',file:'08-relic-run.py',
    description:'Explore the vault. Outsmart the sentries. Recover every relic.',tease:'Explore a whole arena with health and a final objective. Complete Skyline Sprint to unlock.',
    controls:'Arrow keys or W / A / S / D to explore · R to restart',features:['Exploration','Health & win condition'],
    briefing:'Find all six golden relics, then enter the top-right portal. Moving red sentries cause damage. You have a short safe interval after a hit.',
    blanks:[
      blank('health','health = 3\ncollected','3','Begin the adventure with three health points.','Use an assignment to set the initial health.',['0','6']),
      blank('left','move_x = -4','-4','Set leftward movement to negative 4.','Leftward movement decreases the x coordinate.',['4','0']),
      blank('down','move_y = 4','4','Set downward movement to positive 4.','Downward movement increases the y coordinate.',['-4','0']),
      blank('x','player.x = player.x + move_x','player.x + move_x','Add the horizontal movement to the player’s x coordinate.','move_x already contains the direction and speed.',['player.x + move_y','move_x'],['move_x + player.x']),
      blank('safe','invincible = invincible - 1','invincible - 1','Count the safe interval down by one.','The interval must gradually reach zero.',['invincible + 1','invincible * 1']),
      blank('damage','health = health - 1','health - 1','Remove one health point when a sentry hits the player.','Subtract one from the previous health value.',['health + 1','1 - health']),
      blank('collect','collected = collected + 1','collected + 1','Count one more recovered relic.','Keep the existing count and increase it by one.',['collected - 1','6'],['1 + collected']),
      blank('win','if collected == 6 and not game_over:','==','The portal can win the game when the relic count equals six.','Use the equality comparison; the rest of the condition is supplied.',['=','<'])
    ]
  }
];
