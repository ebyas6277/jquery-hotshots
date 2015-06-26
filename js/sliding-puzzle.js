﻿/*
(function ($) {
    alert($);
}
)(jQuery);
*/

$(function () {
    var aspect = "3:4",
        aspectW = parseInt(aspect.split(":")[0]),
        aspectH = parseInt(aspect.split(":")[1]),
        numberOfPieces = aspectW * aspectH,
        randomizer = numberOfPieces * 3,
        container = $("#puzzle"),
        imgContainer = container.find("figure"),
        img = imgContainer.find("img"),
        path = img.attr("src"),
        piece = $("<div/>"),
        pieceW = Math.floor(img.width() / aspectW),
        pieceH = Math.floor(img.height() / aspectH),
        idCounter = 0,
        positions = [],
        prevEmpty = {
            top: 0,
            left: 0,
            bottom: pieceH,
            right: pieceW
        },
        empty = {
            top: 0,
            left: 0,
            bottom: pieceH,
            right: pieceW
        },
        previous = {},
        timer,
        currentTime = {},
        timerDisplay = container.find("#time").find("span");

    for (var x = 0, y = aspectH; x < y; x++) {
        for (var a = 0, b = aspectW; a < b; a++) {
            var top = pieceH * x,
                left = pieceW * a,
                bottom = top + pieceH,
                right = left + pieceW;

            piece.clone()
                .attr("id", idCounter++)
                .css({
                    width: pieceW,
                    height: pieceH,
                    position: "absolute",
                    top: top,
                    left: left,
                    backgroundImage: ["url(", path, ")"].join(""),
                    backgroundPosition: [
                        "-", pieceW * a, "px ",
                        "-", pieceH * x, "px"
                    ].join("")
                }).appendTo(imgContainer);

            positions.push({ top: top, left: left, bottom: bottom, right: right });
        }
    }

    img.remove();
    container.find("#0").remove();
    positions.shift();

    $("#start").on("click", function (e) {
        var pieces = imgContainer.children();
        
        function moveRandomPiece(array) {
            var i = array.length,
                current,
                tempPiece,
                randomPiece,
                movableArray = [],
                alertArray = [];

            $.each(array, function (i) {
                current = array.eq(i);
                
                if (!testPosition(current)) {
                    return;
                }

                movableArray.push(current);
            });

            randomPiece = movableArray[Math.floor(Math.random() * movableArray.length)];

            while (randomPiece.position().top == prevEmpty.top && randomPiece.position().left == prevEmpty.left) {
                randomPiece = movableArray[Math.floor(Math.random() * movableArray.length)];
            }

            movePiece(randomPiece);

            function movePiece(piece) {
                var current = getPosition(piece);

                piece.css({
                    top: empty.top,
                    left: empty.left,
                });

                prevEmpty.top = empty.top;
                prevEmpty.left = empty.left;
                prevEmpty.bottom = empty.bottom;
                prevEmpty.right = empty.right;
                previous.top = current.top;
                previous.left = current.left;
                empty.top = previous.top;
                empty.left = previous.left;
                empty.bottom = previous.top + pieceH;
                empty.right = previous.left + pieceW;
            }

            function testPosition(piece) {
                var top = piece.position().top,
                    left = piece.position().left,
                    bottom = top + pieceH,
                    right = left + pieceW;

                //Fails if position is not on x and y axis of empty space.
                if (left !== empty.left && top !== empty.top) {
                    return false;
                }

                //Determine if piece is next to empty space and add to moveable array.
                if (bottom < empty.top ||
                    top > empty.bottom ||
                    left > empty.right ||
                    right < empty.left) {
                    return false;
                }

                return true;
            }
        }

        function shuffle() {
            for (var cnt = 0; cnt <= randomizer; cnt++) {
                moveRandomPiece(pieces);
            }
        }

        shuffle();
        container.find("#ui").find("p").not("#time").remove();

        if (timer) {
            clearInterval(timer);
            timerDisplay.text("00:00:00");
        }

        timer = setInterval(updateTime, 1000);
        currentTime.seconds = 0;
        currentTime.minutes = 0;
        currentTime.hours = 0;

        function updateTime() {
            var newHours,
                newMins,
                newSeconds;

            if (currentTime.hours == 23 && currentTime.minutes === 59 && currentTime.seconds === 59) {
                clearInterval(timer);
            } else if (currentTime.minutes === 59 && currentTime.seconds === 59) {
                currentTime.hours++;
                currentTime.minutes = 0;
                currentTime.seconds = 0;
            } else if(currentTime.seconds === 59) {
                currentTime.minutes++;
                currentTime.seconds = 0;
            } else {
                currentTime.seconds++;
            }

            newHours = (currentTime.hours <= 9) ? "0" + currentTime.hours : currentTime.hours;
            newMins = (currentTime.minutes <= 9) ? "0" + currentTime.minutes : currentTime.minutes;
            newSeconds = (currentTime.seconds <= 9) ? "0" + currentTime.seconds : currentTime.seconds;
            timerDisplay.text([newHours, ":", newMins, ":", newSeconds].join(""));
        }

        pieces.draggable({
            containment: "parent",
            grid: [pieceW, pieceH],
            start: function (e, ui) {
                var current = getPosition(ui.helper);

                if (current.left === empty.left) {
                    ui.helper.draggable("option", "axis", "y");
                } else if (current.top === empty.top) {
                    ui.helper.draggable("option", "axis", "x");
                } else {
                    ui.helper.trigger("mouseup");
                    return false;
                }

                if (current.bottom < empty.top ||
                    current.top > empty.bottom ||
                    current.left > empty.right ||
                    current.right < empty.left) {
                    ui.helper.trigger("mouseup");
                    return false;
                }

                previous.top = current.top;
                previous.left = current.left;
            },
            drag: function (e, ui) {
                var current = getPosition(ui.helper);

                ui.helper.draggable("option", "revert", false);

                if (current.top === empty.top && current.left === empty.left) {
                    ui.helper.trigger("mouseup");
                    return false;
                }

                if (current.top > empty.bottom ||
                    current.bottom < empty.top ||
                    current.left > empty.right ||
                    current.right < empty.left) {
                    ui.helper.trigger("mouseup").css({
                        top: previous.top,
                        left: previous.left
                    });

                    return false;
                }
            },
            stop: function (e, ui) {
                var current = getPosition(ui.helper),
                    correctPieces = 0;

                if (current.top === empty.top && current.left === empty.left) {
                    empty.top = previous.top;
                    empty.left = previous.left;
                    empty.bottom = previous.top + pieceH;
                    empty.right = previous.left + pieceW;
                }

                $.each(positions, function (i) {
                    var currentPiece = $("#" + (i + 1)),
                        currentPosition = getPosition(currentPiece);

                    if (positions[i].top === currentPosition.top && positions[i].left === currentPosition.left) {
                        correctPieces++;
                    }
                });

                if (correctPieces === positions.length) {
                    clearInterval(timer);

                    $("<p/>", {
                        text: "Congratulations, you solved the puzzle!"
                    }).appendTo("#ui");

                    var totalSeconds = (currentTime.hours * 60 * 60) + (currentTime.minutes * 60) + currentTime.seconds;

                    if (localStorage) {
                        if (localStorage.getItem("puzzleBestTime")) {
                            var bestTime = localStorage.getItem("puzzleBestTime");

                            if (totalSeconds < bestTime) {
                                localStorage.setItem("puzzleBestTime", totalSeconds);

                                $("<p/>", {
                                    text: "You got a new best time!"
                                }).appendTo("#ui");
                            }
                        } else {
                            localStorage.setItem("puzzleBestTime", totalSeconds);

                            $("<p/>", {
                                text: "You got a new best time!"
                            }).appendTo("#ui");
                        }
                    }                    
                }
            }
        });

        function getPosition(el) {
            return {
                top: parseInt(el.css("top")),
                bottom: parseInt(el.css("top")) + pieceH,
                left: parseInt(el.css("left")),
                right: parseInt(el.css("left")) + pieceW
            }
        }
    });
});