import { department_data } from "./data/department.js";

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
  console.log(
    `https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&${string}&q=""`
  );

  const resp = await fetch(
    `https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&${string}&q=""`
  );
  const respData = await resp.json();
  console.log(respData);

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
