// test-loader.js

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

const params = new URLSearchParams(window.location.search);
const category = params.get("category");
const categoryNameEl = document.getElementById("categoryName");
const testGrid = document.getElementById("testGrid");
const backBtnContainer = document.getElementById("backBtnContainer");

// Clear any inlined content for dynamic loading
testGrid.innerHTML = "";

if (!category) {
  // No category selected — load categories dynamically
  categoryNameEl.textContent = "All Categories";
  testGrid.className = "test-grid";

  fetch("tests/list.json")
    .then((response) => {
      if (!response.ok) throw new Error("Failed to load category list.");
      return response.json();
    })
    .then((data) => {
      const categories = data.list || [];

      categories.forEach((cat) => {
        const tile = document.createElement("div");
        tile.className = "test-card";
        const icons = {
          apocalypse: "☢️",
          government: "🏛️",
          horror: "🧟",
          intelligence: "🧠",
          meme: "😹",
          pop: "🎤",
          rock: "🎸",
          scifi: "👽",
          emotions: "<3",
        };
        const param = cat.toLowerCase().replace(/[^a-z0-9]+/g, "");

        tile.innerHTML = `<span class="icon">${
          icons[param] || "❓"
        }</span><br>${cat}`;

        tile.onclick = () => {
          window.location.href = `test-loader.html?category=${param}`;
        };

        testGrid.appendChild(tile);
      });

      backBtnContainer.style.display = "none";
    })
    .catch((error) => {
      console.error("Error loading root category list:", error);
      testGrid.innerHTML = "<p>Failed to load categories.</p>";
    });
} else {
  // Category selected — load quizzes dynamically
  categoryNameEl.textContent = capitalize(category);
  testGrid.className = "test-list";

  fetch(`tests/${category}/list.json`)
    .then((response) => {
      if (!response.ok) throw new Error("Failed to load quiz list.");
      return response.json();
    })
    .then((data) => {
      const quizTitles = data.list || [];
      const quizFiles = data.listJSON || [];

      if (quizTitles.length === 0) {
        testGrid.innerHTML = "<p>No tests found in this category yet.</p>";
      } else {
        quizTitles.forEach((title, index) => {
          const filename = quizFiles[index];
          const item = document.createElement("div");
          item.className = "test-list-item";
          item.textContent = title;

          item.onclick = () => {
            window.location.href = `quiz.html?category=${category}&test=${filename}`;
          };

          testGrid.appendChild(item);
        });
      }

      backBtnContainer.style.display = "block";
    })
    .catch((error) => {
      console.error("Error loading quiz list for category:", error);
      testGrid.innerHTML = "<p>Failed to load quizzes.</p>";
      backBtnContainer.style.display = "block";
    });
}
