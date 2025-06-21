function updateTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const dayName = now.toLocaleString('default', { weekday: 'long' });
    const monthName = now.toLocaleString('default', { month: 'long' });
    const date = now.getDate();
    const year = now.getFullYear();

    const timeString = `${hours}:${minutes} | ${dayName} ${monthName} ${date}, ${year}`;
    document.getElementById('datetime').textContent = timeString;
}

// Update every second
setInterval(updateTime, 1000);
updateTime();

// slection rooms
const buttons = document.querySelectorAll('.room-button');
const devices = document.querySelectorAll('.device');

buttons.forEach(button => {
    button.addEventListener('click', () => {
        // Switch active button
        buttons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        const selectedRoom = button.getAttribute('data-room');

        // Show/hide devices
        devices.forEach(device => {
            const deviceRoom = device.getAttribute('data-room');
            if (deviceRoom === selectedRoom) {
                device.style.display = 'block';
            } else {
                device.style.display = 'none';
            }
        });
    });
});

// Initialize page with Living room selected by default
window.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.room-button.active').click();
});



/* dimmer */
const dimmer = document.getElementById('dimmer');
const light = document.getElementById('light');
const brightnessValue = document.getElementById('brightnessValue');
const channelSelect = document.getElementById('channelSelect');

// Store brightness values for 8 channels
let channelValues = [100, 100, 100, 100, 100, 100, 100, 100];

// When channel changes, update the slider and light
channelSelect.addEventListener('change', () => {
    const selectedChannel = parseInt(channelSelect.value);
    const currentValue = channelValues[selectedChannel];
    dimmer.value = currentValue;
    updateLight(currentValue);
    sendDimmerValue(selectedChannel, currentValue);
});

dimmer.addEventListener('input', () => {
    const selectedChannel = parseInt(channelSelect.value);
    const newValue = parseInt(dimmer.value);
    channelValues[selectedChannel] = newValue;
    updateLight(newValue);
    sendDimmerValue(selectedChannel, newValue);
});

function updateLight(value) {
    const brightness = value / 100;
    light.style.opacity = brightness;
    brightnessValue.textContent = `${value}%`;
}

function sendDimmerValue(channel, value) {
    fetch(`${esp32_ip}/dimmer?channel=${channel}&value=${value}`)
        .then(response => response.text())
        .then(data => console.log("ESP32 Response:", data))
        .catch(err => console.error("Error sending to ESP32:", err));
}
// Initialize light on page load
updateLight(dimmer.value);



// switch
const switches = document.querySelectorAll('.switch input');

switches.forEach((toggle, index) => {
    toggle.addEventListener('change', () => {
        const device = toggle.closest('.device');
        const status = device.querySelector('.status');

        if (toggle.checked) {
                device.classList.add('on');
                device.classList.remove('off');
                status.textContent = 'ON';
        } else {
                device.classList.add('off');
                device.classList.remove('on');
                status.textContent = 'OFF';
        }
    });
});


// Temperature Control
let value = 24;
const max = 30;
const min = 16;
const temp_circle = document.getElementById('tempProgress');
const temp_display = document.getElementById('tempDisplay');
const temp_total_length = 440;

function updateDial() {
  let percent = (value - min) / (max - min);
  let dash = percent * temp_total_length;
  temp_circle.setAttribute('stroke-dasharray', `${dash} ${temp_total_length - dash}`);
  temp_display.textContent = `${value}°C`;
}

function increase() {
  if (value < max) {
    value++;
    updateDial();
  }
}

function decrease() {
  if (value > min) {
    value--;
    updateDial();
  }
}

updateDial();

// Humidity Control
let humidvalue = 75;
const humid_max = 100;
const humid_min = 0;
const humid_circle = document.getElementById('humidProgress');
const humid_display = document.getElementById('humidDisplay');
const humid_total_length = 440;

function humid_updateDial() {
  let percent = (humidvalue - humid_min) / (humid_max - humid_min);
  let dash = percent * humid_total_length;
  humid_circle.setAttribute('stroke-dasharray', `${dash} ${humid_total_length - dash}`);
  humid_display.textContent = `${humidvalue}%`;
}

function humid_increase() {
  if (humidvalue < humid_max) {
    humidvalue += 5;
    humid_updateDial();
  }
}

function humid_decrease() {
  if (humidvalue > humid_min) {
    humidvalue-=5;
    humid_updateDial();
  }
}

humid_updateDial();



// control light of esp32


// ip input 
let esp32_ip = "http://192.168.137.154/";  // Default IP

document.getElementById("ipButton").addEventListener("click", function() {
    document.getElementById("ipModal").style.display = "block";
    document.getElementById("ipInput").value = esp32_ip; // pre-fill existing IP
});

document.getElementById("setButton").addEventListener("click", function() {
    let newIp = document.getElementById("ipInput").value.trim();
    if(newIp) {
        esp32_ip = newIp;
        alert("ESP32 IP set to: " + esp32_ip);
        document.getElementById("ipModal").style.display = "none";
    } else {
        alert("Please enter a valid IP.");
    }
});

document.getElementById("cancelButton").addEventListener("click", function() {
    document.getElementById("ipModal").style.display = "none";
});

// Optional: close modal when clicking outside modal content
window.onclick = function(event) {
    let modal = document.getElementById("ipModal");
    if (event.target == modal) {
        modal.style.display = "none";
    }
}




// Select the specific switch
const livingRoomLightSwitch = document.getElementById('living-room-light-switch');

// Listen to toggle event
livingRoomLightSwitch.addEventListener('change', () => {
    const action = livingRoomLightSwitch.checked ? 'on' : 'off';
    sendCommand(action);
});

function sendCommand(action) {
    logMessage(`Sending: /led/${action}`);

    fetch(`${esp32_ip}/led/${action}`)
        .then(response => response.text())
        .then(data => {
            logMessage(`Response: ${data}`);
        })
        .catch(error => {
            logMessage(`Error: ${error}`);
        });
}

function logMessage(message) {
    const logOutput = document.getElementById('log-output');
    const timestamp = new Date().toLocaleTimeString();
    logOutput.innerHTML += `[${timestamp}] ${message}<br>`;
    logOutput.scrollTop = logOutput.scrollHeight; // Auto scroll to bottom
}


function logMessage(message) {
    const logOutput = document.getElementById('log-output');
    const timestamp = new Date().toLocaleTimeString();

    let color = "#fff";  // default white

    if (message.startsWith("Sending:")) {
        color = "#ff0"; // yellow
    } else if (message.startsWith("Response:")) {
        color = "#0f0"; // green
    } else if (message.startsWith("Error:")) {
        color = "#f00"; // red
    }

    logOutput.innerHTML += `<span style="color:${color}">[${timestamp}] ${message}</span><br>`;
    logOutput.scrollTop = logOutput.scrollHeight;
}


function syncSwitchState() {
    fetch(`${esp32_ip}/led/state`)
        .then(response => response.text())
        .then(state => {
            logMessage(`State from ESP32: ${state}`);
            if (state.trim() === "on") {
                livingRoomLightSwitch.checked = true;
                // You may want to update device status visually too:
                const device = livingRoomLightSwitch.closest('.device');
                device.classList.add('on');
                device.classList.remove('off');
                device.querySelector('.status').textContent = "ON";
            } else {
                livingRoomLightSwitch.checked = false;
                const device = livingRoomLightSwitch.closest('.device');
                device.classList.add('off');
                device.classList.remove('on');
                device.querySelector('.status').textContent = "OFF";
            }
        })
        .catch(error => {
            logMessage(`Error getting state: ${error}`);
        });
}

// Call this after DOM loaded:
window.addEventListener('DOMContentLoaded', () => {
    syncSwitchState();
});

// communication log animation
const toggleLogBtn = document.getElementById('toggle-log-btn');
const logPanel = document.getElementById('log-panel');

toggleLogBtn.addEventListener('click', () => {
    if (logPanel.classList.contains('active')) {
        logPanel.classList.remove('active');
        toggleLogBtn.textContent = "Show Communication Log";
    } else {
        logPanel.classList.add('active');
        toggleLogBtn.textContent = "Hide Communication Log";
    }
});

