import { department_data } from "./data/department.js";

let global_search_data = "";
const love_btn = document.querySelector(".love-btn");
// 이것만 따로 js옮기기 파일 새로 random js
// variable related to random
const country = document.querySelector("#country");
const start_year = document.querySelector("#start_year");
const end_year = document.querySelector("#end_year");
const random_btn = document.querySelector(".random-btn");
const random_text = document.querySelector("#random-text");
const random_data = document.querySelector(".random-data");
let random_string_api = "";
let countryHTML = `<option value="" disabled selected>Choose Department</option>`;
let startHTML = `<option value="">Any Start Year</option>`;
let endHTML = `<option value="">Any End Year</option>`;

searchArtFetch(436203);
load_like_art();

department_data.departments.forEach((e) => {
  countryHTML += `<option value="${e.displayName}">${e.displayName}</option>`;
});

for (let i = 100; i <= 2000; i += 100) {
  startHTML += `<option value="${i}">${i}</option>`;
  endHTML += `<option value="${i}">${i}</option>`;
}

country.innerHTML = countryHTML;
start_year.innerHTML = startHTML;
end_year.innerHTML = endHTML;

// print current selected department_data, yeat on bottom
let random_select_department = "";
country.addEventListener("change", (event) => {
  random_select_department = `${event.target.value}`;
});

let random_select_start = 100;
start_year.addEventListener("change", (event) => {
  random_select_start = `${event.target.value}`;
});

let random_select_end = 2000;
end_year.addEventListener("change", (event) => {
  random_select_end = `${event.target.value}`;
});

random_btn.addEventListener("click", () => {
  random_select_start = parseInt(random_select_start);
  random_select_end = parseInt(random_select_end);

  if (random_select_department == "") {
    random_text.innerHTML =
      "<p style='color:red'>Have to choose department</p>";
  } else {
    if (random_select_start >= random_select_end) {
      random_text.innerHTML =
        "<p style='color:red'>Start Year can't be same or larger than End Year</p>";
    } else {
      department_data.departments.forEach((e) => {
        if (e.displayName == random_select_department) {
          random_select_department = e.departmentId;
        }
      });
      random_string_api = `dateBegin=${random_select_start}&dateEnd=${random_select_end}&departmentId=${random_select_department}`;

      getRandomFetch(random_string_api);
    }
  }
});

async function getRandomFetch(string) {
  love_btn.classList.remove("active");
  const resp = await fetch(
    `https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&${string}&q=""`
  );
  const respData = await resp.json();

  if (!respData || !respData.objectIDs || respData.objectIDs.length === 0) {
    // Handle the case when no data is returned or no object IDs are present
    random_text.innerHTML =
      "<p style='color:red'>Sorry, specific art does not exist. Please try again.</p>";
    return;
  }

  const randomIndex = Math.floor(Math.random() * respData.total);

  searchArtFetch(respData.objectIDs[randomIndex]);
}

async function searchArtFetch(randomIndex) {
  const resp = await fetch(
    `https://collectionapi.metmuseum.org/public/collection/v1/objects/${randomIndex}`
  );

  const searchData = await resp.json();
  if (searchData.message === "ObjectID not found") {
    getRandomFetch(random_string_api);
  }
  global_search_data = searchData;

  console.log(searchData);
  let search = searchData.title + " " + searchData.artistAlphaSort;
  search = search.split(" ").join("%20");
  document.getElementById("random-img").src = searchData.primaryImage;

  random_data.innerHTML = `
            <h6>${searchData.title}</h6>
            <h6 class="artist">${searchData.artistAlphaSort}(${searchData.artistBeginDate}
              - ${searchData.artistEndDate})</h6>
            <p>${searchData.department}, GalleryNumber: "${searchData.GalleryNumber}"</p>
            <p>${searchData.dimensions}</p>
            <p>
              <a
                href="${searchData.objectURL}"
                target="_blank"
                >Resource Link</a
              >
              <a
                href=https://www.google.com/search?tbm=isch&q=${search}
                target="_blank"
                >google image</a
              >
            </p>
          `;

  random_text.innerHTML = "";
}

love_btn.addEventListener("click", () => {
  if (love_btn.classList.contains("active")) {
    remvoeArtLS(global_search_data);
    love_btn.classList.remove("active");
  } else {
    addArtLS(global_search_data);
    love_btn.classList.add("active");
  }
  load_like_art();
});

// get art id from local storage
function getArtLS() {
  const artIds = JSON.parse(localStorage.getItem("artIds"));
  return artIds === null ? [] : artIds;
}

// add art id to local storage
function addArtLS(art) {
  const artIds = getArtLS();
  const artId = { title: art.title, image: art.primaryImage };
  localStorage.setItem("artIds", JSON.stringify([...artIds, artId]));
}

// remove art id from local storage
function remvoeArtLS(art) {
  const artIds = getArtLS();

  console.log(art.title);

  localStorage.setItem(
    "artIds",
    JSON.stringify(artIds.filter((a) => a.title !== art.title))
  );
}

// load like art
function load_like_art() {
  const liked_art_container = document.querySelector(".liked-art-container");
  const art_array = JSON.parse(localStorage.getItem("artIds")) || [];
  liked_art_container.innerHTML = "";

  if (art_array.length === 0) {
    liked_art_container.innerHTML = "<h4>No Liked Art Found</h4>";
    return;
  }
  art_array.forEach((element, index) => {
    const artItem = document.createElement("li");
    artItem.innerHTML = `
      <img
        src="${element.image}"
        alt=""
        class="popup-trigger"
        data-index="${index}"
      />
      <br>
      <p>${element.title}</p>
    `;
    liked_art_container.appendChild(artItem);
  });

  // Add click event to trigger popup
  const popupTriggers = document.querySelectorAll(".popup-trigger");
  popupTriggers.forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      const index = event.target.getAttribute("data-index");
      openPopup(art_array[index]);
    });
  });
}

// Open the popup
function openPopup(art) {
  const modal = document.getElementById("artModal");
  const modalImage = document.getElementById("modal-image");
  const modalTitle = document.getElementById("modal-title");

  modalImage.src = art.image;
  modalTitle.textContent = art.title;

  const existingDeleteButton = document.querySelector(".delete-button");
  if (existingDeleteButton) {
    existingDeleteButton.remove();
  }

  const deleteButton = document.createElement("button");
  deleteButton.textContent = "Delete from Liked List";
  deleteButton.classList.add("delete-button");
  modalTitle.parentElement.appendChild(deleteButton);

  modal.style.display = "block";

  deleteButton.addEventListener("click", () => {
    remvoeArtLS(art);
    load_like_art();
    modal.style.display = "none";
  });

  const closeBtn = document.querySelector(".close");
  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
}
