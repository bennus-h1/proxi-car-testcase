const map = document.getElementById("map")
const title = document.getElementsByClassName("title")[1]
title.style.opacity = "1"

function setOpacity(element, increment) {
    element.style.opacity = String(parseFloat(element.style.opacity) + increment)
}

map.onmouseenter = function() {
    for (var i = 0; i < 5; i++) {
        setTimeout(setOpacity, i * 50, title, -0.2) 
    }
}

map.onmouseout = function() {
    for (var i = 0; i < 5; i++) {
        setTimeout(setOpacity, i * 50, title, 0.2) 
    }
}

let port
let reader
let buffer = ""
let increment = 0
let spotValues = [1, 1, 1, 1, 1, 1, 1, 1]

const colors = ["rgb(0, 240, 0)", "rgb(240, 0, 0)", "rgb(240, 100, 0)"]
const values = ["Vacant", "Occupied", "Reserved"]
const spots = document.getElementsByClassName("list-element")

const selectmenu = document.getElementById("select-menu")
const reservebtn = document.getElementById("reserve-select")
let selected
let reserved

reservebtn.addEventListener("click", () => {
    if (reserved) {spots[reserved].style.border = "0"}
    reserved = selected
    spots[reserved].style.border = "1px solid blue"
})

for (let i = 0; i < spots.length; i++) {
    const spot = spots[i];

    spot.addEventListener("click", () => {
        selected = i
        selectmenu.style.order = String(spot.style.order)
        selectmenu.classList.remove("animate-selectmenu")
        selectmenu.classList.add("animate-selectmenu")

        void selectmenu.offsetWidth;
    });

    selectmenu.addEventListener("animationend", () => {
        selectmenu.classList.remove("animate-selectmenu")
    });
}

const intromenu = document.getElementById("intro-screen")
const accepter = document.getElementById("request-accept")
const requester = document.getElementById("port-requester")

accepter.addEventListener("click", async () => {
    intromenu.style.opacity = "0"
    intromenu.style.pointerEvents = "none"

    requester.style.display = "none"
    requester.style.pointerEvents = "none"
try {
     // 1. Prompt user to select an Arduino/Serial device
    port = await navigator.serial.requestPort();

    // 2. Open the port (Match the baudRate with your Arduino code, e.g., 9600)
    await port.open({ baudRate: 9600 });
    keepReading = true;

    // 3. Set up streams to pipe binary data into text
    const textDecoder = new TextDecoderStream();
    const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
    reader = textDecoder.readable.getReader();

    // 4. Start reading incoming data continuously
    readSerialData();
} catch (err) {
    console.error('Error connecting to serial port:', err);
}
})

async function readSerialData() {
    while (port.readable && keepReading) {
     try {
        const { value, done } = await reader.read();
        if (done) {
        // Reader has been canceled
        break;
        }
        if (value) {
            if (value.indexOf("n") > -1) {
                for (let i = 0; i < spots.length; i++) {
                    const char = buffer.charAt(i + 1)

                    console.log(String(i + 1) + " " + String(char))
                    const circle = spots[i].getElementsByClassName("list-statuscircle")[0]
                    circle.style.backgroundColor = colors[parseInt(char)]

                    const info = spots[i].getElementsByClassName("list-statusinfo")[0]
                    info.textContent = info.textContent.replace(values[spotValues[i]], values[parseInt(char)])

                    spotValues[i] = parseInt(char)
                }

                buffer = ""
                buffer = buffer.replaceAll(" ", "")
            }
            else {
                buffer = buffer + value
            }
            //if (value === undefined || value == "" || value == " ") {}
            //else {
            //    for (let i = 0; i < 8; i++) {
            //         const char = value.charAt(i)
            //     if (parseInt(char) != spotValues[increment]) {
            //         console.log(value)
            //         const circle = spots[increment].getElementsByClassName("list-statuscircle")[0]
            //         circle.style.backgroundColor = colors[parseInt(char)]

            //         const info = spots[increment].getElementsByClassName("list-statusinfo")[0]
            //         info.textContent = info.textContent.replace(values[spotValues[increment]], values[parseInt(char)])

            //         spotValues[increment] = parseInt(char)
            //     } 
            //     }
            // }

            if (increment == 7) {increment = 0} else {increment++}
        }
        } catch (error) {
          console.error('Read error:', error);
          break;
        }
      }
    }