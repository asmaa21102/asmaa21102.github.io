var swiper = new Swiper(".mySwiper", {
  effect: "coverflow",
  grabCursor: true,
  centeredSlides: true,
  slidesPerView: "auto",

  coverflowEffect: {
    rotate: 30,
    stretch: 0,
    depth: 200,
    modifier: 1,
    slideShadows: true,
  },

  loop: true,
});
const content = [
  [
    "To use the system, upload your medical test report file below, then click on the Extract button.",
   " The system will automatically read and analyze the results, compare them with standard values, and provide a simple explanation for each test.",
    ' and show a simple explanation.',
    "Thank you for using our app! We hope you enjoy all its features and find it useful."
  ],
  [
    "The main goal of this project is to simplify medical test reports for users. ",
    "It aims to analyze results, compare them with normal ranges, and provide a preliminary health assessment, including detecting possible risks such as anemia or diabetes.",
  ],
  
  [
    "The motivation behind this project comes from the difficulty many people face when trying to understand medical reports. ",
    "Since most users do not have a medical background, this system helps bridge the gap by providing clear and understandable explanations.",
    
  ]
];

const btnWhyReact = document.getElementById("btn-why-react");
const btnCoreFeature = document.getElementById("btn-core-features");
const btnResources = document.getElementById("btn-resources");
const tabContent = document.getElementById("tab-content");

function displayContent(items) {
  let listContent = "";
  for (const item of items) {
    listContent += `<li>${item}</li>`;
  }
  const list = document.createElement("ul");
  tabContent.innerHTML = ""; // clear existing content
  list.innerHTML = listContent; // insert new content
  tabContent.append(list);
}

function highlightButton(btn) {
  // Clear all existing styling / highlights
  btnWhyReact.className = "";
  btnCoreFeature.className = "";
  btnResources.className = "";
  btn.className = "active"; // set new style / highlight
}

function handleClick(event) {
  const btnId = event.target.id;
  highlightButton(event.target);
  if (btnId === "btn-why-react") {
    displayContent(content[0]);
  } else if (btnId === "btn-core-features") {
    displayContent(content[1]);
  } else {
    displayContent(content[2]);
  }
}

displayContent(content[0]); // initially show this content

btnWhyReact.addEventListener("click", handleClick);
btnCoreFeature.addEventListener("click", handleClick);
btnResources.addEventListener("click", handleClick);
