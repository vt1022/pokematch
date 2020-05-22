// ---------------------------------------------------
// readme before marking
// ---------------------------------------------------
// .js line 166 - reduce timer count for ease of testing
// main.scss line 26 - add opacity on overlays for ease of testing
// .js line 56 - encountered a problem I couldn't solve
// ---------------------------------------------------
// ---------------------------------------------------
const memApp = {}; // namespace

memApp.timerCount = 0; 
memApp.amountOfCards = 20; // add difficulty button to change this later
memApp.pokemonsFromApi = [];
// -----------------
// fisher yates shuffle algorithm:
// -----------------
// from: https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
memApp.shuffleArray = function(a) {
  let j, x, i;
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
  return a;
}
// -----------------
// populate cards
// -----------------
// take img src as argument
// write function to populate cards with for loop
// append html of cards to container
memApp.populateCards = function() {
  $(".main__cards-container").empty();
  memApp.shuffleArray(memApp.pokemonsFromApi);
  // take the first X pokemon from the shuffled array where X is half of the game cards amount
  const pokemonCards = memApp.pokemonsFromApi.splice(0, memApp.amountOfCards / 2);
  // double the the array to make pairs and shuffle them again
  pokemonCards.push(...pokemonCards);
  memApp.shuffleArray(pokemonCards);
  
  pokemonCards.forEach((pokemonObject) => {
    const { name, image } = pokemonObject;

    let htmlToAppend = `
      <div class="main__cards-container__card">
        <button class="main__cards-container__inner" tabindex="0" aria-label="${name}">
          <div class="main__cards-container__card__front">
            <img src="./assets/favicon.png" alt="pokeball">
          </div>
          <div class="main__cards-container__card__back">
            <img src="${image}" alt="${name}" class="main__cards-container__card__image">
          </div>
        </button>
      </div>`;

    $(".main__cards-container").append(htmlToAppend);
  });
}
// -----------------
// click on cards
// -----------------
// event handler on container, then target card inner
memApp.cardIsClicked = function() {
  let clicksInContainer = -1;
  const clickedPokeName = [];
  const clickedCard = [];
  let matchedCards = 0;
  
  $(".main__cards-container").on("click", ".main__cards-container__inner", function() {
    clicksInContainer++;
    const $this = $(this); // used on ln 102 prevents clicking too fast bug?
    let accessPrevious = clicksInContainer - 1;
    console.log(clickedPokeName);
    console.log(clickedCard);
    
    $(this).toggleClass("flip-card");
    clickedCard.push($(this));
    clickedPokeName.push($(this).attr("aria-label"));
    
    // every even click, compare clickedPokeName[current] vs [previous] and do some shit
    if ( (clicksInContainer + 1) % 2 === 0 ) {
      if (clickedPokeName[clicksInContainer] === clickedPokeName[accessPrevious] && matchedCards === (memApp.amountOfCards - 2)) {
        // if won:
        clearInterval(timer);
        const wonHtml = `
        You WON! You managed to MATCH all the Pokémon! CLICK start to test your SKILLS again!
        <button class="footer__landing__welcome__button"><span>&#9654</span>START</button>`;
        
        $(".footer__landing__welcome p").html(wonHtml);
        $(".footer").show();
        resetTrackers();

      } else if (clickedPokeName[clicksInContainer] === clickedPokeName[accessPrevious] && matchedCards < memApp.amountOfCards) {
        // if cards match but didn't win yet:
        matchedCards+= 2;
      } else if (clickedPokeName[clicksInContainer] != clickedPokeName[accessPrevious]) {
        // cards don't match:
        setTimeout(function() {
          // flip cards back:
          $this.toggleClass("flip-card");
          $(clickedCard[accessPrevious]).toggleClass("flip-card");
        }, 600);

      } else { // error
        const errorHtml = `
        Sorry, there was an error on our end. Please try again!
        <button class="footer__landing__welcome__button"><span>&#9654</span>START</button>`;
        
        $(".footer__landing__welcome p").html(errorHtml);
        $(".footer").show();
        alert("error! safi, please stop breaking my shit");
        console.log("error! safi, please stop breaking my shit");
        resetTrackers();
      }
    }
  });

  // reset and start button click event:
  $(".header__list__item__reset, .footer__landing__welcome")
  .on("click", ".footer__landing__welcome__button", function(e) {
    e.preventDefault();
    // clicking reset/start button brings user back to landing
    memApp.populateCards();
      
    // timer
    memApp.timerCount = 40; 
    $(".header__list__item__timer").html(memApp.timerCount+'s');
  
    const timer = setInterval(function() {
      memApp.timerCount--;
  
      if (memApp.timerCount > 0) {
        $(".header__list__item__timer").html(memApp.timerCount+'s');
        
      } else if (memApp.timerCount <= 0) {
        const lostHtml = `
        You ran OUT of TIME! Better luck NEXT time. CLICK start to try again!
        <button class="footer__landing__welcome__button"><span>&#9654</span>START</button>`;
        
        $(".footer__landing__welcome p").html(lostHtml);
        $(".footer").show();
        clearInterval(timer);
        resetTrackers();
  
      } else {
        const errorHtml = `
        Sorry, there was an error on our end. Please try again!
        <button class="footer__landing__welcome__button"><span>&#9654</span>START</button>`;
        
        $(".footer__landing__welcome p").html(errorHtml);
        $(".footer").show();
        clearInterval(timer);
        alert("error! safi, please stop breaking my shit");
        console.log("error! safi, please stop breaking my shit");
        resetTrackers();
      }
      
    }, 1000); // const timer
    $("footer").hide();
  }); // reset and start button click event

  const resetTrackers = function() {
    clicksInContainer = -1;
    clickedPokeName.length = 0;
    clickedCard.length = 0;
    matchedCards = 0;
  }
}
// -----------------
// pokemon api promise
// -----------------
memApp.pokemonApi = function(pokeId) {
  const pokePromise = $.ajax({
    url: `https://pokeapi.co/api/v2/pokemon/${pokeId}/`,
    dataType: "json",
    method: "GET"
  });
  return pokePromise;
}
// -----------------
// pokemon api
// -----------------
// save pokemon info into local array
memApp.apiDataToLocal = function() {
  for (let i = 1; i < 152; i++) {
    memApp.pokemonApi(i).then((result) => {
      const pokemonName = result.name;
      const pokemonImageUrl = result.sprites.front_default;

      memApp.pokemonsFromApi.push({
        name: pokemonName,
        image: pokemonImageUrl
      });
    })
  }
}
// -----------------
// init
// -----------------
memApp.init = function() {
  memApp.apiDataToLocal();
  memApp.cardIsClicked();
}
// -----------------
// doc ready
// -----------------
$(function() {
  memApp.init();
});