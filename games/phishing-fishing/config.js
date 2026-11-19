/* Event rules: ten balanced messages, one absolute 60-second deadline. */
(function(root){
  const config=Object.freeze({roundSeconds:60,roundQuestions:10,practiceQuestions:32});
  if(typeof module!=="undefined"&&module.exports)module.exports=config;else root.GAME_CONFIG=config;
})(typeof window!=="undefined"?window:globalThis);
