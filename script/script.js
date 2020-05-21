// ---------------------------------------------------
// readme before marking
// ---------------------------------------------------
// .js line 166 - reduce timer count for ease of testing
// main.scss line 26 - add opacity on overlays for ease of testing
// .js line 56 - encountered a problem I couldn't solve
// ---------------------------------------------------
// ---------------------------------------------------
const memApp = {}; // namespace

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
    const { name, image } = pokemonObject

    let htmlToAppend = `
    <div class="main__cards-container__card">
      <div class="main__cards-container__card__overlay" aria-label="${name}">
      </div>
      <img src="${image}" alt="${name}" class="main__cards-container__card__image">
    </div>`;

    $(".main__cards-container").append(htmlToAppend);
  });

  $(".footer").hide();
}
// -----------------
// click on cards
// -----------------
// event handler on container, then target card overlay
memApp.cardIsClicked = function(timerStartsAt) {
  let clicksInContainer = -1;
  const clickedPokeName = [];
  const clickedCard = [];
  let matchedCards = 0;
  
  $(".main__cards-container").on("click", ".main__cards-container__card__overlay", function() {
    clicksInContainer++;
    const $this = $(this);
    $this.css("width", "0%").css("height", "0%");
    
    let accessPrevious = clicksInContainer - 1;
    clickedCard.push($(this));
    clickedPokeName.push($(this)[0].nextElementSibling.alt);
    
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

      } else if (clickedPokeName[clicksInContainer] === clickedPokeName[accessPrevious] && matchedCards < memApp.amountOfCards) {
        // if cards match but didn't win yet:
        matchedCards+= 2;

      } else if (clickedPokeName[clicksInContainer] != clickedPokeName[accessPrevious]) {
        // cards don't match:
        setTimeout(function() {
          // put overlay back on to both cards
          $this.css("width", "100%").css("height", "100%");
          $(clickedCard[accessPrevious]).css("width", "100%").css("height", "100%");
        }, 600);

      } else {
        // error
        console.log("error! stop being safi");

      }
    }

  });

  // timer
  // timerCount is a variable to add difficulty option in the future
  let timerCount = parseInt(timerStartsAt); 
  $(".header__list__item__timer").html(timerCount+'s');

  const timer = setInterval(function() {
    timerCount--;

    if (timerCount > 0) {
      $(".header__list__item__timer").html(timerCount+'s');
      
    } else if (timerCount <= 0) {
      clearInterval(timer);
      
      const lostHtml = `
      You ran OUT of TIME! Better luck NEXT time. CLICK start to try again!
      <button class="footer__landing__welcome__button"><span>&#9654</span>START</button>`;
      
      $(".footer__landing__welcome p").html(lostHtml);
      $(".footer").show();

    } else {
      clearInterval(timer);
      console.log("error! safi, please stop breaking my shit");

    }
    
  }, 1000);
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
  // clicking reset/start button brings user back to landing
  $(".header__list__item__reset, .footer__landing__welcome")
  .on("click", ".footer__landing__welcome__button", function(e) {
    e.preventDefault();
    memApp.populateCards();
    // cardIsClicked param sets timer value. lower it for testing.
    memApp.cardIsClicked(40);

  });

}
// -----------------
// doc ready
// -----------------
$(function() {
  memApp.init();
});