const map = document.getElementById("map")
const title = document.getElementById("map-container").getElementsByClassName("title")[0]
title.style.opacity = "1"

const adminButton = document.getElementById("admin-button")
const password = document.getElementById("password")
const rText1 = document.getElementById("requester-text")
const rText2 = document.getElementById("requester-text2")

let isadministrator = false

function setOpacity(element, increment) {
    element.style.opacity = String(parseFloat(element.style.opacity) + increment)
}

function isMobileDevice() {
  return window.matchMedia("only screen and (max-width: 760px)").matches;
}
let onMobile = isMobileDevice()


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

adminButton.onclick = function() {
    console.log(password.value)
    if (password.value) {
        console.log("eys")
        if (password.value == "benadmin-freshfood") {
            console.log("super")
            isadministrator = true
            rText1.textContent = "Hello! In order for us to properly track information, port reading should be allowed."
            rText2.textContent = "Accept port reader? (Requires connected port!!)"
        }
    }
    else {
        password.style.opacity = "1"
    }
}

let port
let reader
let buffer = ""
let keepReading = false
let increment = 0
let spotValues = [0, 0, 0, 0, 0, 0, 0, 0]
const spotCords = [53, 39, 56, 44, 59, 49, 62, 53]

const colors = ["rgb(0, 240, 0)", "rgb(240, 0, 0)", "rgb(240, 100, 0)"]
const values = ["Vacant", "Occupied", "Reserved"]
const spots = document.getElementsByClassName("list-element")

const selectmenu = document.getElementById("select-menu")
const reservebtn = document.getElementById("reserve-select")
const trackbtn = document.getElementById("track-select")
const infobtn = document.getElementById("info-select")

const listprop = document.getElementsByClassName("list-property")[0]
const mappin = document.getElementById("map-pin")
let selected
let reserved
let tracked
let infod

let encoder
let writer

function onMenuAction(current, noAnim) {
    selected = current
    if (spotValues[selected] == 2 && spots[selected].style.border === "1px solid orange") {
        reservebtn.textContent = "Stop Reserving"
    }
    else {
        reservebtn.textContent = "Reserve"
    }

    selectmenu.style.position = "relative"
    selectmenu.style.opacity = "1"
    selectmenu.style.pointerEvents = "all"

    selectmenu.style.order = String(spots[selected].style.order)
    selectmenu.classList.remove("animate-selectmenu")

    if (!noAnim) { selectmenu.classList.add("animate-selectmenu") }

    void selectmenu.offsetWidth;
}

infobtn.addEventListener("click", () => {
    const clone = spots[selected].getElementsByClassName("list-statusinfo")[0].cloneNode(true)
    spots[selected].appendChild(clone)
    clone.style.opacity = "1"
    setTimeout(() => {
        clone.remove()
    }, 5000);
})

trackbtn.addEventListener("click", () => {
    if (trackbtn.textContent == "Track") {
        tracked = selected
        console.log(tracked)
        mappin.style.opacity = "1"
        mappin.style.left = String(spotCords[2 * (tracked + 1) - 2] + "%")
        mappin.style.bottom = String(spotCords[2 * (tracked + 1) - 1] + "%")
    }
})

reservebtn.addEventListener("click", () => {
    if (reservebtn.textContent == "Reserve") {
    if (spotValues[selected] != 0) {return} 
    if (reserved != undefined) {spots[reserved].style.border = "0"}
    reserved = selected

    spotValues[reserved] = 2
    if (keepReading) {{
        if (!encoder || !writer) {
            encoder = new TextEncoder();
            writer = port.writable.getWriter();
        }
        // Encode the string into a Uint8Array and write it
        await writer.write(encoder.encode(String(spotValues[reserved]) + "n"));

        writer.releaseLock();
    }
    
    const reserveprop = spots[reserved].getElementsByClassName("list-propcontainer")[0].getElementsByClassName("reserved-prop")[0]
    reserveprop.style.position = "relative"
    reserveprop.style.opacity = "1"

    const resTimeprop = spots[reserved].getElementsByClassName("list-propcontainer")[0].getElementsByClassName("res-time-prop")[0]
    resTimeprop.style.position = "relative"
    resTimeprop.style.opacity = "1"

    spots[reserved].style.border = "1px solid orange"

    const current = spots[reserved]
    const currentInt = reserved
    const interval = setInterval(() => {
        if (spots[reserved] != current) {
            clearInterval(interval);
            reserveprop.style.position = "absolute"
            reserveprop.style.opacity = "0"

            resTimeprop.style.position = "absolute"
            resTimeprop.style.opacity = "0"

            if (spotValues[currentInt] == 2) {spotValues[currentInt] = 0}
            if (spots[reserved] == current) {onMenuAction(reserved, true)}
            resTimeprop.textContent = "120"
        }
        else {
            resTimeprop.textContent = String(parseInt(resTimeprop.textContent) - 1)
            if (parseInt(resTimeprop.textContent) < 1) {
                clearInterval(interval);
                reserveprop.style.position = "absolute"
                reserveprop.style.opacity = "0"

                resTimeprop.style.position = "absolute"
                resTimeprop.style.opacity = "0"

                current.style.border = "0"
                console.log("hejeiwh")
                console.log(spotValues[currentInt])
                if (spotValues[currentInt] == 2) {spotValues[currentInt] = 0}
                if (spots[reserved] == current) {onMenuAction(reserved, true)}
                resTimeprop.textContent = "120"
            }
        }
    }, 1000);
    }
    else {
        if (reserved != undefined) {spots[reserved].style.border = "0"}
        spotValues[reserved] = 0
        spots[reserved].getElementsByClassName("list-propcontainer")[0].getElementsByClassName("res-time-prop")[0].textContent = "120"
        reserved = undefined
    }

    onMenuAction(selected, true)
})

for (let i = 0; i < spots.length; i++) {
    const spot = spots[i];

    spot.addEventListener("click", () => {
        onMenuAction(i)
    });

    selectmenu.addEventListener("animationend", () => {
        selectmenu.classList.remove("animate-selectmenu")
    });
}

setInterval(() => {
    for (let i = 0; i < spots.length; i++) {
        const circle = spots[i].getElementsByClassName("list-statuscircle")[0]
        circle.style.backgroundColor = colors[parseInt(spotValues[i])]

        const info = spots[i].getElementsByClassName("list-statusinfo")[0]
        info.textContent = values[spotValues[i]] + ", " + info.textContent.split(",")[1]
       // info.textContent = info.textContent.replace(values[spotValues[i]], values[parseInt(spotValues[i])])
    }
}, 100);

const intromenu = document.getElementById("intro-screen")
const accepter = document.getElementById("request-accept")
const requester = document.getElementById("port-requester")

accepter.addEventListener("click", async () => {
    adminButton.style.pointerEvents = "none"
    password.style.opacity = "0"
    password.style.pointerEvents = "none"

    intromenu.style.opacity = "0"
    intromenu.style.pointerEvents = "none"

    requester.style.display = "none"
    requester.style.pointerEvents = "none"

    if (!isadministrator) {return}
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