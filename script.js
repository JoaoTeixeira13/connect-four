let currentPlayer = "player1";
let $slots = $(".slot");
let $resetButton = $(".reset");
let $columns = $(".column");

// an array to store future results
let matchedSlots = [];

function switchPlayer() {
    if (currentPlayer === "player1") {
        currentPlayer = "player2";
    } else {
        currentPlayer = "player1";
    }
}

$columns.on("click", function (event) {
    let col = $(event.currentTarget);
    let columns = col.children();
    let currentSlot;
    let whole;
    let rows;
    let $slots;
    let victoryDisplay;

    audio = new Audio("assets/click.wav");
    audio.play();

    for (let i = columns.length - 1; i >= 0; i--) {
        currentSlot = columns.eq(i);
        whole = currentSlot.children();
        //create a row letiable to pass into the checkForVictory function
        rows = $(".row" + i);
        $slots = $(".slot");

        //1. Is the slot free?

        if (!whole.hasClass("player1") && !whole.hasClass("player2")) {
            //remove the hover translucid class, then add the opaque color class
            whole.removeClass(currentPlayer + "Hover");
            whole.addClass(currentPlayer);

            //Check for victory, if any of the invocations returns true there is a winner
            console.log(currentPlayer);
            if (
                checkForVictory(columns) ||
                checkForVictory(rows) ||
                checkForDiagonalVictory($slots)
            ) {
                //manipulate the matched slots array in order to add the victoryFlash class

                for (let i = 0; i < matchedSlots.length; i++) {
                    $(matchedSlots).eq(i).removeClass(currentPlayer);
                    $(matchedSlots).eq(i).addClass("victoryFlash");
                }
                //Victory Dance / start over

                victoryDisplay = $(".victory");

                audioVictory = new Audio("assets/bowdown.m4a");
                audioVictory.play();

                //reveal the reset button once victory is achieved after a delay

                setTimeout(function () {
                    $($resetButton).css("visibility", "visible");
                }, 1000);

                //stop players from keep playing by removing event listeners

                $columns.off("click");
                $columns.off("mouseover");

                //display which player won

                if (currentPlayer === "player1") {
                    victoryDisplay.html("♘ Player 1 won! ");
                    // $(victoryDisplay).css("color", "#2b2024");
                }

                if (currentPlayer === "player2") {
                    victoryDisplay.html("♞ Player 2 won!");
                }
            }

            console.log(
                "switch player ---------------------------",
                currentPlayer
            );

            switchPlayer();
            break;
        }

        //. If no -. Move on
    }
});

function checkForVictory(slots) {
    // 1.set up a counter letiable
    let count = 0;
    let currentSlot;
    let whole;

    //2. move through the slots and

    for (let i = 0; i < slots.length; i++) {
        currentSlot = slots.eq(i);
        whole = currentSlot.children();

        if (whole.hasClass(currentPlayer)) {
            // -increment the counter if the slot has the current player class

            count++;

            //keep track of the winning slots in a separate array

            matchedSlots.push(whole.eq(i).prevObject[0]);
        } else {
            //-reset the counter if it doesn't

            count = 0;
            matchedSlots = [];
        }

        //3. if the counter reaches 4 -we have a win

        if (count == 4) {
            console.log("win");
            return true;
        }
    }
    console.log("no win");

    return false;
}

const numberOfColumns = 7;
const numberOfRows = 6 - 1;

// search for diagonals with dynamic values (previous while statement). step is the
//dynamic value that can change here (either downward 7 or upward 5 will be passed into it)
//(defined in numberOfColumns and numberOfRows)

function searchingDiagonal(nextpos, step, slots, count, nextColumn) {
    // -increment the counter if the slot has the current player class
    nextpos += step;
    let nextSlot = slots.eq(nextpos);
    let nextwhole = nextSlot.children();

    // console.log(
    //     "nextpos",
    //     nextpos,
    //     "\nstep",
    //     step,
    //     "\ncount",
    //     count,
    //     "\nnextColumn",
    //     nextColumn
    // );
    //is nextSlot is in the nextColumn?

    //  does the next element contain the expected next column?
    // on the edge cases the columns don't align immediately next to each other
    // if the condition returns false, the process stops. Conditional check:
    //  nextSlot.parent().hasClass("c" + nextColumn)
    if (
        nextwhole.hasClass(currentPlayer) &&
        nextSlot.parent().hasClass("c" + nextColumn)
    ) {
        // here the value exported to the matched slots array cannot be in JQuery format
        matchedSlots.push(nextwhole[0]);

        nextColumn++;
        count++;

        //3. if the counter reaches 4 -we have a win
        if (count === 4) {
            console.log("win");
            return true;
        }
    } else {
        return false;
    }

    // recursion will keep calling the function until it returns either true or false

    return searchingDiagonal(nextpos, step, slots, count, nextColumn);
}

function checkForDiagonalVictory(slots) {
    let count = 0;
    let currentSlot;
    let whole;

    let parentsClass;
    let currColumn;

    for (let i = 0; i < slots.length; i++) {
        count = 0;
        currentSlot = slots.eq(i);
        whole = currentSlot.children();

        //Extract index from correspondent column parent element
        parentsClass = currentSlot.parent().attr("class").split(/\s+/);
        currColumn = parseInt(parentsClass[1].slice(1));

        //current row
        // let currRow = parseInt(currentSlot.attr("class").slice(8));

        if (whole.hasClass(currentPlayer)) {
            searching = true;
            count++;

            //keep track of matched slots

            matchedSlots.push(whole.eq(i).prevObject[0]);
            console.log("matched slots are", matchedSlots);

            // expected next column
            nextColumn = currColumn + 1;

            // console.log(
            //     "nextpos",
            //     i,
            //     "\nnextColumn",
            //     nextColumn,
            //     "\ncount",
            //     count
            // );
            // check for two possible diagonals with either numberOfRows || numberOfColumns

            if (
                searchingDiagonal(i, numberOfColumns, slots, count, nextColumn)
            ) {
                // console.log(
                //     "numberOfColumns",
                //     numberOfColumns,
                //     "Found a winner"
                // );
                return true;
            } else if (
                searchingDiagonal(i, numberOfRows, slots, count, nextColumn)
            ) {
                // console.log("numberOfRows", numberOfRows, "Found a winner");

                return true;
            }
        } else {
            //-reset the counter if it doesn't
            matchedSlots = [];
            count = 0;
        }
    }
    console.log("no win");
    return false;
}

// reset button functionality

$resetButton.on("click", function () {
    anotherGame();
});

function anotherGame() {
    location.reload();
}

// current player's turn / where will the piece fall next functionality, turn the class on and off with mouseover, mouseout

$columns.on("mouseover", function (event) {
    let col = $(event.currentTarget);
    let columns = col.children();
    let currentSlot;
    let whole;

    for (let i = columns.length - 1; i >= 0; i--) {
        currentSlot = columns.eq(i);
        whole = currentSlot.children();

        //1. Is the slot free?

        if (!whole.hasClass("player1") && !whole.hasClass("player2")) {
            whole.addClass(currentPlayer + "Hover");
            break;
        }
    }
});

$columns.on("mouseout", function (event) {
    let col = $(event.currentTarget);
    let columns = col.children();
    let currentSlot;
    let whole;

    for (let i = columns.length - 1; i >= 0; i--) {
        currentSlot = columns.eq(i);
        whole = currentSlot.children();

        //1. Is the slot free?

        if (!whole.hasClass("player1") && !whole.hasClass("player2")) {
            whole.removeClass(currentPlayer + "Hover");
            break;
        }
    }
});
