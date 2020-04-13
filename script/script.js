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
  $(".footer").hide();
}
// -----------------
// random card order
// -----------------
// add class to each card
// add random order to each card
memApp.randomizeCardOrder = function() {
  setTimeout(function() {
    for ( let i = 1; i <= memApp.amountOfCards; i++ ) {
      const randomOrder = memApp.randomize(100);
      $(`.main__cards-container__card:nth-of-type(${i})`).addClass(`card${i}`);
      $(`.card${i}`).css("order", `${randomOrder}`);
      
      // FIX THIS FOR ACCESSIBILITY
      // set tab indexes in visual order of cards
      // nth-of-type(i) log looked weird so i tried to log nth-of-type(1) to break it down
      // for some reason nth-of-type(1) logs ALL the (.main...overlay)s
      // nth-of-type(anything but 1) logs nothing?

      // $(`.main__cards-container__card__overlay:nth-of-type(${i})`).attr("tabindex", i);
      // console.log(i, $(`.main__cards-container__card__overlay:nth-of-type(${i})`));
      // console.log(i, $(`.main__cards-container__card__overlay:nth-of-type(1)`));
      // console.log(i, $(`.main__cards-container__card__overlay:nth-of-type(2)`));
    }
  }, 600);
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
        }, 300);

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
      console.log(timerCount);
      
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