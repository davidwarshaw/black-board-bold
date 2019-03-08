
const mainLogo = `
.          /####### /###     /####    /##########  /###    |########  /#######  /####   ######## |######          .
.         /###  ### ###              /####   |### /###     |###  #### |##  ###              |### |##  ###         .
.         ###  ### /###              ###     |###/###      |###  #### |##  ###              |### |##   ##         .
.        /###  ### /###     /#####  /##      |###/##       |###  #### |##  ### /#####   |######  |##   ###        .
.       /######### /##      ###### |##       |#####        |######### |##  ### ######   |####    |##    ###       .
.       ########## /##     /###### |##       |#####        |######### |##  ###/######   |####    |##    ####      .
.      /####   /## ###    /### |## |####     |## ###       |###   ### |##  ##/###  |##  |#####   |##    ####      .
.     /####    ## /##########  |###  ######  |## ####      |######### |#########   |### |## |##  |###    ####     .
.    /#####   ### ##########   |###    ##### |##  ####     |########   ########    |### |## |### |###    #####    .
.    |####   /##                                                                                  |###   #####    .
.    |#########                                                                                   |###########    .
.    |#######                                                                                      |##########    .
`;

const subTitle = '.                                  B O L D                                  .';

const topTitle = 'Rogue-ish          Stealth          Tactics';

const codecEq = `
################################
#######################
#############
########
######
#####
####
`;

const codecPortraitC = `
╔════════════════╗
║................║
║................║
║.....▒████████▖.║
║....▒██▘....▒██▌║
║...▒██▘.........║
║...▒██..........║
║...▒██..........║
║...▒██..........║
║...▒██▖.........║
║....▒██▖....▒██▌║
║.....▒████████▘.║
╚════════════════╝
`;

const codecPortraitS = `
╔════════════════╗
║................║
║................║
║.....▒███████▖.▌║
║....▒██▘....▒██.║
║...▒██......▒██.║
║...▒██..........║
║...▒██▖.........║
║....▒██▖........║
║......▒██▖......║
║........▒███▖...║
║...▌▖....▒████▖.║
╚════════════════╝
`;

const helpConversation = [
  'Bold S, come in Bold S...',
  'S here. Capital C, what\'s my mission?',
  'S, your mission is to infiltrate all 12 levels of the facility without being caught. You\'ll start on the left side of the level. Use the arrow keys to move to the "ᐁ" on the right side.',
  'Sounds too easy.',
  'The levels are patroled by guards. Each one has more guards than the last.',
  'Sounds too difficult!',
  'S, you\'ll be able to see the field of view of each guard on the map. When they\'re patroling, you\'re faster than them, but if they see you, they\'ll give chase.',
  'No problem, I can outrun them.',
  'No S, when they\'re chasing you they\'ll be as fast as you and they\'ll be able to move diagonally.',
  'Move diagonally!!?? But that\'s impossible!',
  'The guards have been genetically enhanced to be able to move diagonally. They\'re not invincible though. If you attack them from outside their field of view, you\'ll be able to knock them out.',
  'Not kill them?',
  'No S, this is a purely non-lethal mission. If you attack a guard, they\'ll just be knocked out. They\'ll wake up after a certain number of turns, or if another guard finds them.',
  'I\'ll need to plan my moves carefully.',
  'Yes, use the "z" key to wait a turn.',
  'Anything else I should know?',
  'You\'re as ready as I can make you, S. Good luck!'
];

const winConversation = [
  'Bold S, come in Bold S...',
  'S here.',
  'Congratulations S! The mission was a success. The boss was defeated, the hostages were freed and the world is safe.',
  'Wait, what? I don\'t remember any of that.',
  'Yes, we had to erase your memory S. The ending of the game was too awesome. Every other moment of your life would have paled in comparison. The psychological risk was too great.\nWe had to erase your memory.',
  '...',
  'Don\'t question it S, let\'s debrief.'
];

export default {
  mainLogo,
  subTitle,
  topTitle,
  codecEq,
  codecPortraitC,
  codecPortraitS,
  helpConversation,
  winConversation
};
