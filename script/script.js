const memApp = {}; // namespace

memApp.amountOfCards = 20; // could add difficulty button to change this
// memApp.amountOfCards = 16; 
// memApp.amountOfCards = 36; 
// -----------------
// randomize number
// -----------------
// create randomizer function
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
  $(".main__cards-container").empty();
  for ( let n = 1; n <= memApp.amountOfCards / 2; n++ ) {
    const pokemon = memApp.pokemonApi(memApp.randomize(151));

    for ( let i = 1; i <=2; i++ ) {
      pokemon.then(function(result) {
        const pokemonName = result.name;
        const pokemonImageUrl = result.sprites.front_default;
  
        let htmlToAppend = `
        <div class="main__cards-container__card">
        <button class="main__cards-container__card__overlay" aria-label="${pokemonName}">
        </button>
        <img src="${pokemonImageUrl}" alt="${pokemonName}" class="main__cards-container__card__image">
        </div>`;
  
        $(".main__cards-container").append(htmlToAppend);
      });
    }
  }
  memApp.randomizeCardOrder();
}
// -----------------
// random card order
// -----------------
// add class to each card
// add random order to each card
memApp.randomizeCardOrder = function() {
  setTimeout(() => {
    for ( let i = 1; i <= memApp.amountOfCards; i++ ) {
      const randomOrder = memApp.randomize(100);
      $(`.main__cards-container__card:nth-of-type(${i})`).addClass(`card${i}`);
      $(`.card${i}`).css("order", `${randomOrder}`);
    }
  }, 700);
}
// -----------------
// click on cards
// -----------------
// event handler on container, then target card overlay
memApp.cardIsClicked = function() {
  let clicksInContainer = -1;
  let clickedPokeName = [];
  let clickedCard = [];
  
  $(".main__cards-container").on("click", ".main__cards-container__card__overlay", function() {
    clicksInContainer++;
    $(this).css("width", "0%").css("height", "0%");
    
    let accessPrevious = clicksInContainer - 1;
    clickedCard.push($(this));
    clickedPokeName.push($(this)[0].nextElementSibling.alt);
    
    // every even click, compare clickedPokeName[current] vs [previous] and do some shit
    if ( (clicksInContainer + 1) % 2 === 0 ) {
      if (clickedPokeName[clicksInContainer] === clickedPokeName[accessPrevious]) {
        console.log("they match!");

      } else if (clickedPokeName[clicksInContainer] != clickedPokeName[accessPrevious]) {
        console.log("they dont match!");

        setTimeout(() => {
          $(this).css("width", "100%").css("height", "100%");
          $(clickedCard[accessPrevious]).css("width", "100%").css("height", "100%");
        }, 600);
      } else {
        console.log("stop being safi");
      }
    }

  });
}
// -----------------
// pokemon api
// -----------------
// save pokemon promise in function
memApp.pokemonApi = function(pokeId) {
  const pokePromise = $.ajax({
    url: `https://pokeapi.co/api/v2/pokemon/${pokeId}/`,
    dataType: "json",
    method: "GET"
  });

  return pokePromise;
}
// -----------------
// init
// -----------------
memApp.init = function() {
  memApp.populateCards();
  memApp.cardIsClicked();
}
// -----------------
// doc ready
// -----------------
$(function() {
  memApp.init();
});