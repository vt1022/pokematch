const memApp = {}; // namespace

// -----------------
// randomize number
// -----------------
memApp.randomize = function(maxNumber) {
  return Math.floor(Math.random() * maxNumber) + 1;
};
// -----------------
// populate cards
// -----------------
// take img src as argument
// write function to populate cards with for loop
// append html of cards to container
memApp.populateCards = function() {
  for ( let n = 1; n <= 8; n++) {
    const pokemon = memApp.pokemonApi(memApp.randomize(151));

    for ( let i = 1; i <=2; i++ ) {

      pokemon.then(function(result) {
        const pokemonName = result.name;
        const pokemonImageUrl = result.sprites.front_default;
  
        let htmlToAppend = `
        <div class="main__cards-container__card card${n}">
          <div class="main__cards-container__card__overlay"></div>
          <img src="${pokemonImageUrl}" alt="${pokemonName}" class="main__cards-container__card__image">
        </div>`;
  
        $(".main__cards-container").append(htmlToAppend);
      });
    }
    
  }
}
// -----------------
// pokemon api
// -----------------
memApp.pokemonApi = function(pokeId) {
  const pokePromise = $.ajax({
    url: `https://pokeapi.co/api/v2/pokemon/${pokeId}/`,
    dataType: "json",
    method: "GET"
  });

  return pokePromise;
  // console.log(pokePromise);
}
// -----------------
// init
// -----------------
memApp.init = function() {
  memApp.populateCards();
}
// -----------------
// doc ready
// -----------------
$(function() {
  memApp.init();
});