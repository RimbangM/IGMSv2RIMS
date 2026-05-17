const map = L.map('map', {
  zoomControl: false
}).setView([-7.96301, 112.615822], 13);

// =========================
// TILE LAYER
// =========================

L.tileLayer(
  'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  {
    maxZoom: 19
  }
).addTo(map);

// =========================
// ZOOM POSITION
// =========================

L.control.zoom({
  position: 'bottomright'
}).addTo(map);

// =========================
// MARKERS
// =========================

let markers = {};

// =========================
// TRAIN ICON
// =========================

const trainIcon = L.icon({

  iconUrl: 'train.png',

  iconSize: [50, 50],

  iconAnchor: [25, 25],

  popupAnchor: [0, -20]

});

// =========================
// PARAMETER UNITS
// =========================

const units = {

  "Engine Speed": "RPM",
  "Battery Voltage": "VDC",
  "Charger Alternator": "VDC",

  "Oil Pressure": "Bar",
  "Coolant Temp": "°C",
  "Oil Temperature": "°C",

  "Fuel Level Daily Tank": "%",
  "Generator Percentage Power": "%",

  "Gen Freq": "Hz",

  "L1-N": "VAC",
  "L2-N": "VAC",
  "L3-N": "VAC",

  "L1-L2": "VAC",
  "L2-L3": "VAC",
  "L3-L1": "VAC",

  "Gen L1": "A",
  "Gen L2": "A",
  "Gen L3": "A",

  "Power L1": "kW",
  "Power L2": "kW",
  "Power L3": "kW",
  "Power Total": "kW",

  "Voltage (R)": "VAC",
  "Voltage (S)": "VAC",
  "Voltage (T)": "VAC",

  "Current (R)": "A",
  "Current (S)": "A",
  "Current (T)": "A",

  "Fuel Delivery Pump": "Bar",
  "Fuel Temperature": "°C",
  "Fuel Consumption": "L/H"

};

// =========================
// LOAD DATA
// =========================

async function loadData() {

  try {

    const response = await fetch(
      'https://script.google.com/macros/s/AKfycbxWweS6KqpC9CkIcWz0peHfxfeawWVf-BqXo0QAUuXCvtNNuXlpt1PC1vOdmPDgIXNSAw/exec'
    );

    const data = await response.json();

    // CLEAR SIDEBAR

    document.getElementById("generator-list").innerHTML = "";

    data.forEach(unit => {

      const lat = parseFloat(unit.Latitude);
      const lng = parseFloat(unit.Longitude);

      if (isNaN(lat) || isNaN(lng)) return;

      // =========================
      // FORMAT TIMESTAMP
      // =========================

      let formattedTime = "-";

      if (unit.Timestamp) {

        formattedTime = new Date(
          unit.Timestamp
        ).toLocaleString("id-ID", {

          timeZone: "Asia/Jakarta"

        });

      }

      // =========================
      // FORMAT LOCATION
      // =========================

      let locationText = "Location Not Available";

      if (unit.Location && unit.Location !== "") {

        locationText = `
          <a href="https://www.google.com/maps?q=${lat},${lng}"
            target="_blank"
            style="
              color:#38bdf8;
              text-decoration:none;
              font-weight:bold;
            ">
            ${unit.Location}
          </a>
        `;

      }

      // =========================
      // TABLE DATA
      // =========================

      let engineRows = "";
      let electricalRows = "";
      let radiatorRows = "";
      let otherRows = "";

      for (const key in unit) {

        // SKIP COORDINATE

        if (
          key === "Latitude" ||
          key === "Longitude"
        ) continue;

        // SKIP DUPLICATE

        if (
          key === "Location" ||
          key === "Timestamp" 

        ) continue;

        // SKIP ENERGY

        if (
          key === "Energy (R)" ||
          key === "Energy (S)" ||
          key === "Energy (T)" ||
           
          key === "Power (R)" ||
          key === "Power (S)" ||
          key === "Power (T)"
        ) continue;

        let value = unit[key];
        let unitText = units[key] || "";

        if (
          value === undefined ||
          value === null ||
          value === ""
        ) {

          value = "-";

        }

        // =========================
        // RENAME LABEL
        // =========================

        let displayKey = key;

        if (key === "Device")
          displayKey = "Generator";

        // MOTOR RADIATOR LABEL

        if (key === "Voltage (R)")
          displayKey = "Voltage R-N";

        if (key === "Voltage (S)")
          displayKey = "Voltage S-N";

        if (key === "Voltage (T)")
          displayKey = "Voltage T-N";

        if (key === "Current (R)")
          displayKey = "Current U";

        if (key === "Current (S)")
          displayKey = "Current V";

        if (key === "Current (T)")
          displayKey = "Current W";

        // =========================
        // BUILD ROW
        // =========================

        const row = `

          <tr>
            <td>${displayKey}</td>
            <td>${value} ${unitText}</td>
          </tr>

        `;

        // =========================
        // ENGINE DATA
        // =========================

        if (

          key.includes("Engine") ||
          key.includes("Oil") ||
          key.includes("Coolant") ||
          key.includes("Fuel")

        ) {

          engineRows += row;

        }

        // =========================
        // MOTOR RADIATOR
        // =========================

        else if (

          key === "Voltage (R)" ||
          key === "Voltage (S)" ||
          key === "Voltage (T)" ||

          key === "Current (R)" ||
          key === "Current (S)" ||
          key === "Current (T)"

        ) {

        }

        // =========================
        // GENERATOR
        // =========================

        else if (

          key.includes("Voltage") ||
          key.includes("Power") ||
          key.includes("Current") ||
          key.includes("Energy") ||
          key.includes("Freq") ||
          key.includes("Battery") ||
          key.includes("L1") ||
          key.includes("L2") ||
          key.includes("L3") ||
          key.includes("Gen") ||
          key.includes("Charger") ||
          key.includes("pf")

        ) {

          electricalRows += row;

        }

        // =========================
        // OTHER DATA
        // =========================

        else {

          // STATUS PALING BAWAH

          if (

            key === "LVR" ||
            key === "UPR" ||
            key === "FPK" ||
            key === "FPK FAILURE" ||
            key === "swt5State"

          ) {

            otherRows += "";

          }

          else {

            otherRows += row;

          }

        }

      }

      // =========================
      // MOTOR RADIATOR ORDER
      // =========================

      radiatorRows = `

        <tr>
          <td>Voltage R-N</td>
          <td>${unit["Voltage (R)"] || "-"} VAC</td>
        </tr>

        <tr>
          <td>Voltage S-N</td>
          <td>${unit["Voltage (S)"] || "-"} VAC</td>
        </tr>

        <tr>
          <td>Voltage T-N</td>
          <td>${unit["Voltage (T)"] || "-"} VAC</td>
        </tr>

        <tr>
          <td>Current U</td>
          <td>${unit["Current (R)"] || "-"} A</td>
        </tr>

        <tr>
          <td>Current V</td>
          <td>${unit["Current (S)"] || "-"} A</td>
        </tr>

        <tr>
          <td>Current W</td>
          <td>${unit["Current (T)"] || "-"} A</td>
        </tr>

      `;

      // =========================
      // TOTAL POWER RADIATOR
      // =========================

      const powerR = parseFloat(unit["Power (R)"]) || 0;
      const powerS = parseFloat(unit["Power (S)"]) || 0;
      const powerT = parseFloat(unit["Power (T)"]) || 0;

      const totalRadiatorPower =
        ((powerR + powerS + powerT) / 1000).toFixed(2);

      radiatorRows += `

        <tr>
          <td>Power Total</td>
          <td>${totalRadiatorPower} kW</td>
        </tr>

      `;

      // =========================
      // POPUP CONTENT
      // =========================

      const popupContent = `

      <div class="popup">

      <h2>${unit.Device || "-"}</h2>

        <div class="popup-table-wrapper">

          <table class="popup-table">

            ${otherRows}

            <tr>
              <td>Location</td>
              <td>${locationText}</td>
            </tr>

            <tr>
              <td>Timestamp</td>
              <td>${formattedTime}</td>
            </tr>

            <!-- ENGINE -->

            <tr>
              <td colspan="2" class="section-title">
                ENGINE
              </td>
            </tr>

            ${engineRows}

            <!-- GENERATOR -->

            <tr>
              <td colspan="2" class="section-title">
                GENERATOR
              </td>
            </tr>

            ${electricalRows}

            <!-- MOTOR RADIATOR -->

            <tr>
              <td colspan="2" class="section-title">
                MOTOR RADIATOR
              </td>
            </tr>

            ${radiatorRows}

            <!-- STATUS -->

            <tr>
              <td colspan="2" class="section-title">
                STATUS
              </td>
            </tr>

            <tr>
              <td>LVR</td>
              <td>${unit["LVR"] || "-"}</td>
            </tr>

            <tr>
              <td>UPR</td>
              <td>${unit["UPR"] || "-"}</td>
            </tr>

            <tr>
              <td>FPK</td>
              <td>${unit["FPK"] || "-"}</td>
            </tr>

            <tr>
              <td>FPK FAILURE</td>
              <td>${unit["FPK FAILURE"] || "-"}</td>
            </tr>

            <tr>
              <td>swt5State</td>
              <td>${unit["swt5State"] || "-"}</td>
            </tr>

          </table>

        </div>

      </div>

      `;

      // =========================
      // UPDATE MARKER
      // =========================

      if (markers[unit.Device]) {

        markers[unit.Device]
          .setLatLng([lat, lng])
          .setPopupContent(popupContent);

      }

      // =========================
      // CREATE MARKER
      // =========================

      else {

        const marker = L.marker(
          [lat, lng],
          { icon: trainIcon }
        )
        .addTo(map)
        .bindPopup(popupContent);

        markers[unit.Device] = marker;

      }

      // =========================
      // STATUS
      // =========================

      let statusClass = "status-off";

      if (unit["Engine Status"] === "ON") {

        statusClass = "status-on";

      }

      // =========================
      // SIDEBAR CITY
      // =========================

      let city = "-";

      if (unit.Location) {

        const parts = unit.Location.split(",");

        if (parts.length >= 2) {

          city = parts[parts.length - 3]?.trim() || parts[0];

        }

      }

      // =========================
      // SIDEBAR CARD
      // =========================

      const card = document.createElement("div");

      card.className = "generator-card";

      card.innerHTML = `

        <div class="generator-title">
          ${unit.Device || "-"}
        </div>

        <div class="generator-data">
          Engine Status :
          <span class="${statusClass}">
            ${unit["Engine Status"] || "-"}
          </span>
        </div>

        <div class="generator-data">
          Time : ${formattedTime}
        </div>

        <div class="generator-data">
          Location : ${city}
        </div>

        <div class="generator-data">
          RPM : ${unit["Engine Speed"] || "-"} RPM
        </div>

        <div class="generator-data">
          Battery : ${unit["Battery Voltage"] || "-"} VDC
        </div>

        <div class="generator-data">
          Engine Temp : ${unit["Coolant Temp"] || "-"} °C
        </div>

        <div class="generator-data">
          Fuel Consumption : ${unit["Fuel Consumption"] || "-"} L/H
        </div>

        <div class="generator-data">
          Power Total : ${unit["Power Total"] || "-"} kW
        </div>

      `;

      // =========================
      // CARD CLICK
      // =========================

      card.addEventListener("click", () => {

        Object.values(markers).forEach(marker => {

          marker.closePopup();

        });

        map.setView([lat, lng], 16);

        markers[unit.Device].openPopup();

      });

      // =========================
      // ADD CARD
      // =========================

      document
        .getElementById("generator-list")
        .appendChild(card);

    });

  } catch(error) {

    console.log(error);

  }

}

// =========================
// FIRST LOAD
// =========================

loadData();

// =========================
// REALTIME REFRESH
// =========================

setInterval(loadData, 5000);

// =========================
// SIDEBAR TOGGLE
// =========================

const toggleBtn = document.getElementById("toggleSidebar");

const sidebar = document.querySelector(".sidebar");

toggleBtn.addEventListener("click", () => {

  sidebar.classList.toggle("closed");

  setTimeout(() => {

    map.invalidateSize();

  }, 300);

});

// =========================
// CLICK MAP CLOSE POPUP
// =========================

map.on("click", () => {

  Object.values(markers).forEach(marker => {

    marker.closePopup();


  });

});
