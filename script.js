document.addEventListener("DOMContentLoaded", function () {
  const addTimeBtn = document.querySelector(".addTimeBtn");
  const driverTimes = document.getElementById("driverTimes");
  const driverInfoContainer = document.getElementById("driverInfo");
  const driverForm = document.getElementById("driverForm");

  addTimeBtn.addEventListener("click", function (e) {
    e.preventDefault();

    const newTimeWrapper = document.createElement("div");
    newTimeWrapper.classList.add("driverTimeWrapper");

    const removeTimeButton = document.createElement("button");
    removeTimeButton.classList.add("removeTimeBtn");
    removeTimeButton.textContent = "Remove";
    removeTimeButton.style.backgroundColor = "red";
    removeTimeButton.style.color = "white";
    removeTimeButton.addEventListener("click", function () {
      newTimeWrapper.remove();
    });

    const label = document.createElement("label");
    label.setAttribute("for", "driverTime");
    label.textContent = "Driver time:";

    const input = document.createElement("input");
    input.setAttribute("type", "text");
    input.classList.add("driverTime");
    input.setAttribute("name", "driverTime");
    input.setAttribute("required", "");
    input.setAttribute("pattern", "^[0-9]{1,2}:[0-5][0-9].[0-9]{3}*?$");
    input.setAttribute(
      "title",
      "Please enter time in format (Minutes):(Seconds).(Milliseconds) followed by an optional asterisk (*)"
    );

    newTimeWrapper.appendChild(removeTimeButton);
    newTimeWrapper.appendChild(label);
    newTimeWrapper.appendChild(input);

    driverTimes.appendChild(newTimeWrapper);
  });

  function parseTime(time) {
    const [min, sec, ms] = time.split(/[:.]/).map(parseFloat);
    return min * 60 * 1000 + sec * 1000 + ms;
  }

  function isInvalidTime(time) {
    return time.endsWith("*");
  }

  function displayDriverInfo(driverInfo) {
    const driverInfoDiv = document.createElement("div");
    driverInfoDiv.classList.add("driverInfo");

    const driverNameHeading = document.createElement("h2");
    driverNameHeading.textContent = `#${driverInfo.position} - Driver: ${driverInfo.name}`;
    driverInfoDiv.appendChild(driverNameHeading);

    const driverTimesList = document.createElement("ul");

    let fastestTimeDisplay =
      driverInfo.fastestTime !== null ? driverInfo.fastestTime : "No valid lap";
    const listItemFastestTime = document.createElement("li");
    listItemFastestTime.textContent = `Fastest Time: ${fastestTimeDisplay}`;
    driverTimesList.appendChild(listItemFastestTime);

    const showAllTimesButton = document.createElement("button");
    showAllTimesButton.classList.add("showAllTimesBtn");
    showAllTimesButton.textContent = `Show all lap times`;
    showAllTimesButton.addEventListener("click", function () {
      const listItemAllTimes = document.createElement("li");
      const allTimesList = document.createElement("ul");
      listItemAllTimes.textContent = `Lap times:`;

      driverInfo.lapTimes.forEach((time, index) => {
        const lapItem = document.createElement("li");
        if (isInvalidTime(time)) {
          lapItem.textContent = `${index + 1}: ${time.replace(
            "*",
            ""
          )} (Invalid Lap)`;
          lapItem.style.color = "red";
        } else {
          lapItem.textContent = `${index + 1}: ${time}`;
        }
        allTimesList.appendChild(lapItem);
      });

      listItemAllTimes.appendChild(allTimesList);
      driverTimesList.appendChild(listItemAllTimes);
      showAllTimesButton.style.display = "none";
    });

    const validLapTimes = driverInfo.lapTimes.filter(
      (time) => !isInvalidTime(time)
    );
    driverTimesList.appendChild(showAllTimesButton);
    driverInfoDiv.appendChild(driverTimesList);

    const driverInfoArray = Array.from(driverInfoContainer.children);
    driverInfoArray.push(driverInfoDiv);

    driverInfoArray.sort((a, b) => {
      const fastestTimeA = a.querySelector("li")
        ? parseTime(a.querySelector("li").textContent.split(": ")[1])
        : Infinity;
      const fastestTimeB = b.querySelector("li")
        ? parseTime(b.querySelector("li").textContent.split(": ")[1])
        : Infinity;

      const isInvalidA = driverInfoArray.some((driver) =>
        driver.querySelector("li").textContent.includes("No valid lap")
      );
      const isInvalidB = driverInfoArray.some((driver) =>
        driver.querySelector("li").textContent.includes("No valid lap")
      );

      if (isInvalidA && isInvalidB) {
        if (fastestTimeA !== fastestTimeB) {
          return fastestTimeA - fastestTimeB;
        }
      } else if (isInvalidA && !isInvalidB) {
        return 1;
      } else if (!isInvalidA && isInvalidB) {
        return -1;
      }

      return fastestTimeA - fastestTimeB;
    });

    driverInfoContainer.innerHTML = "";
    driverInfoArray.forEach((driver, index) => {
      const driverName = driver.querySelector("h2").textContent.split(" - ")[1];
      const updatedDriverName = driver.querySelector("h2");
      updatedDriverName.textContent = `#${index + 1} - ${driverName}`;
      driverInfoContainer.appendChild(driver);
    });

    const deleteDriverButton = document.createElement("button");
    deleteDriverButton.classList.add("deleteDriverBtn");
    deleteDriverButton.textContent = "Delete";
    deleteDriverButton.style.backgroundColor = "red";
    deleteDriverButton.style.color = "white";
    deleteDriverButton.addEventListener("click", function () {
      driverInfoDiv.remove();
    });

    driverInfoDiv.appendChild(deleteDriverButton);
    driverInfoContainer.appendChild(driverInfoDiv);
  }

  function findFastestTime(timesArray) {
    const validLapTimes = timesArray.filter((time) => !isInvalidTime(time));

    if (validLapTimes.length === 0) {
      return null;
    }

    let fastestTime = validLapTimes[0];
    for (let i = 1; i < validLapTimes.length; i++) {
      if (compareTimes(validLapTimes[i], fastestTime) < 0) {
        fastestTime = validLapTimes[i];
      }
    }

    return fastestTime;
  }

  function compareTimes(time1, time2) {
    const [min1, sec1, ms1] = time1.split(/[:.]/).map(parseFloat);
    const [min2, sec2, ms2] = time2.split(/[:.]/).map(parseFloat);

    if (min1 !== min2) {
      return min1 - min2;
    } else if (sec1 !== sec2) {
      return sec1 - sec2;
    } else {
      return ms1 - ms2;
    }
  }

  driverForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const driverName = document.getElementById("driverName").value;
    const driverTimeInputs = document.querySelectorAll(".driverTime");
    const driverTimesArray = Array.from(driverTimeInputs).map(
      (input) => input.value
    );

    const fastestTime = findFastestTime(driverTimesArray);

    const driverInfo = {
      name: driverName,
      fastestTime: fastestTime,
      lapTimes: driverTimesArray,
    };

    displayDriverInfo(driverInfo);
    driverForm.reset();
    resortDriverList();
  });

  function updatePositions() {
    const driverInfoArray = Array.from(driverInfoContainer.children);
    driverInfoArray.forEach((driver, index) => {
      const updatedDriverName = driver.querySelector("h2");
      updatedDriverName.textContent = `#${index + 1} - ${
        driver.querySelector("h2").textContent.split(" - ")[1]
      }`;
    });
  }

  driverInfoContainer.addEventListener("click", function (event) {
    if (event.target.classList.contains("deleteDriverBtn")) {
      const deletedElement = event.target.parentElement;
      deletedElement.remove();
      updatePositions();
    }
  });

  function resortDriverList() {
    const driverInfoArray = Array.from(driverInfoContainer.children);
    driverInfoArray.sort((a, b) => {
      const fastestTimeA = parseTime(
        a.querySelector("li").textContent.split(": ")[1]
      );
      const fastestTimeB = parseTime(
        b.querySelector("li").textContent.split(": ")[1]
      );

      return fastestTimeA - fastestTimeB;
    });

    driverInfoContainer.innerHTML = "";
    driverInfoArray.forEach((driver, index) => {
      const driverName = driver.querySelector("h2").textContent.split(" - ")[1];
      const updatedDriverName = driver.querySelector("h2");
      updatedDriverName.textContent = `#${index + 1} - ${driverName}`;
      driverInfoContainer.appendChild(driver);
    });

    displaySimplifiedLeaderboard(driverInfoArray);
  }

  function displaySimplifiedLeaderboard(driverInfoArray) {
    const simplifiedLeaderboard = document.getElementById(
      "simplifiedLeaderboard"
    );

    simplifiedLeaderboard.innerHTML = "";
    driverInfoArray.forEach((driver, index) => {
      const driverName = driver.querySelector("h2").textContent.split(" - ")[1];
      const fastestTime = driver
        .querySelector("ul > li")
        .textContent.split(": ")[1];

      const leaderboardItem = document.createElement("div");
      leaderboardItem.textContent = `#${
        index + 1
      } - ${driverName} (${fastestTime})`;

      simplifiedLeaderboard.appendChild(leaderboardItem);
    });
  }

  const simplifiedLeaderboard = document.getElementById(
    "simplifiedLeaderboard"
  );
  simplifiedLeaderboard.style.position = "absolute";
  simplifiedLeaderboard.style.top = "20px";
  simplifiedLeaderboard.style.left = "80%";
  simplifiedLeaderboard.style.transform = "translateX(-50%)";
  const resortButton = document.createElement("button");
  resortButton.textContent = "Re-sort and Create Leaderboard";
  resortButton.setAttribute("id", "resortBtn");
  resortButton.addEventListener("click", function () {
    resortDriverList();
  });

  const leftContainer = document.createElement("div");
  leftContainer.style.cssText = `
    overflow: hidden;
    opacity: 0;
    position: absolute;
    top: 50%;
    left: 20px;
    transform: translateY(-235%);
    transition: opacity 0.3s ease-in-out;
  `;
  leftContainer.appendChild(resortButton);
  document.body.appendChild(leftContainer);

  leftContainer.addEventListener("mouseenter", function () {
    leftContainer.style.display = `none`;
    leftContainer.style.opacity = "0";
  });

  leftContainer.addEventListener("mouseleave", function () {
    leftContainer.style.opacity = "0";
  });
});
