
function createPlayState() {
  return {
    level: 1,
    alerts: 0,
    captures: 0,
    escapes: 0,
    guardsKnockedOut: 0,
    guardsWokeUp: 0,
    totalTurns: 0
  };
}

export default {
  createPlayState
};
