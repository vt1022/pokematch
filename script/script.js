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
memApp.populateCards = function() {
  $("footer").hide();
  $(".main__cards-container").empty();
  memApp.shuffleArray(memApp.pokemonsFromApi);
  // take the first X pokemon from the shuffled array where X is half of the game cards amount
  const pokemonCards = memApp.pokemonsFromApi.splice(0, memApp.amountOfCards / 2);
  // double the the array to make pairs and shuffle them again
  pokemonCards.push(...pokemonCards);
  memApp.shuffleArray(pokemonCards);
  
  // append html of cards to container
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
// global function and variables for reusable code
// -----------------
memApp.clicksInContainer = -1;
memApp.matchedCards = 0;
memApp.clickedCard = [];
memApp.clickedPokeName = [];
memApp.resetTrackers = function() {
  this.clicksInContainer = -1;
  this.clickedPokeName.length = 0;
  this.clickedCard.length = 0;
  this.matchedCards = 0;
  $(".header__list__item__timer").empty();
}
// -----------------
// click on cards
// -----------------
// event handler on container, then target card inner
memApp.cardIsClicked = function() {
  $(".main__cards-container").on("click", ".main__cards-container__inner", function() {
    memApp.clicksInContainer++;
    const $this = $(this); // used on ln 111 prevents clicking too fast bug?
    let accessPrevious = memApp.clicksInContainer - 1;
    memApp.clickedCard.push($(this));
    memApp.clickedPokeName.push($(this).attr("aria-label"));
    $(this).toggleClass("flip-card").attr("disabled", true);
    
    // every even click, compare clickedPokeName[current] vs [previous] and do some shit
    if ( (memApp.clicksInContainer + 1) % 2 === 0 ) {
      if (memApp.clickedPokeName[memApp.clicksInContainer] === memApp.clickedPokeName[accessPrevious] && memApp.matchedCards === (memApp.amountOfCards - 2)) {
        // if won:
        clearInterval(memApp.timer);
        const wonHtml = `
        You WON! You managed to MATCH all the Pokémon! CLICK start to test your SKILLS again!
        <button class="footer__landing__welcome__button"><span>&#9654</span>START</button>`;
        
        $(".footer__landing__welcome p").html(wonHtml);
        setTimeout(function() {
          $(".footer").show();
          memApp.resetTrackers();
        }, 1000);

      } else if (memApp.clickedPokeName[memApp.clicksInContainer] === memApp.clickedPokeName[accessPrevious] && memApp.matchedCards < memApp.amountOfCards) {
        // if cards match but didn't win yet:
        memApp.matchedCards+= 2;
        $this.find(".main__cards-container__card__back").toggleClass("matched");
        $(memApp.clickedCard[accessPrevious]).find(".main__cards-container__card__back").toggleClass("matched");
        
      } else if (memApp.clickedPokeName[memApp.clicksInContainer] != memApp.clickedPokeName[accessPrevious]) {
        // cards don't match:
        setTimeout(function() { // flip cards back:
          $this.toggleClass("flip-card").attr("disabled", false);
          $(memApp.clickedCard[accessPrevious]).toggleClass("flip-card").attr("disabled", false);
        }, 600);

      } else { // error
        const errorHtml = `
        Sorry, there was an error on our end. Please try again!
        <button class="footer__landing__welcome__button"><span>&#9654</span>START</button>`;
        
        $(".footer__landing__welcome p").html(errorHtml);
        $(".footer").show();
        alert("error! safi, please stop breaking my shit");
        console.log("error! safi, please stop breaking my shit");
        memApp.resetTrackers();
      }
      $this.blur();
    }
  });
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
  // reset and start button click event:
  $(".header__list__item__reset, .footer__landing__welcome")
  .on("click", ".footer__landing__welcome__button", function() {
    memApp.populateCards();
    memApp.timerCount = 40; 

    memApp.timer = setInterval(function() {
      $(".header__list__item__timer").html(memApp.timerCount+'s');
      memApp.timerCount--;

      if (memApp.timerCount > 0) {
        $(".header__list__item__timer").html(memApp.timerCount+'s');
        
      } else if (memApp.timerCount <= 0) {
        const lostHtml = `
        You ran OUT of TIME! Better luck NEXT time. CLICK start to try again!
        <button class="footer__landing__welcome__button"><span>&#9654</span>START</button>`;
        
        $(".footer__landing__welcome p").html(lostHtml);
        $(".footer").show();
        clearInterval(memApp.timer);
        memApp.resetTrackers();

      } else {
        const errorHtml = `
        Sorry, there was an error on our end. Please try again!
        <button class="footer__landing__welcome__button"><span>&#9654</span>START</button>`;
        
        $(".footer__landing__welcome p").html(errorHtml);
        $(".footer").show();
        clearInterval(memApp.timer);
        alert("error! safi, please stop breaking my shit");
        console.log("error! safi, please stop breaking my shit");
        memApp.resetTrackers();

      }
    }, 1000); // const timer
  }); // reset and start button listener
}
// -----------------
// doc ready
// -----------------
$(function() {
  memApp.init();
});