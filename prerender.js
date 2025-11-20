const fs = require("fs").promises;
const path = require("path");

async function prerender() {
  // Read original test-loader.html
  const template = await fs.readFile("test-loader.html", "utf8");

  // Read categories
  const categoriesData = await fs.readFile("tests/list.json", "utf8");
  const { list: categories } = JSON.parse(categoriesData);

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

  // Generate category tiles
  let categoryTiles = "";
  categories.forEach((cat) => {
    const param = cat.toLowerCase().replace(/[^a-z0-9]+/g, "");
    categoryTiles += `<div class="test-card" onclick="window.location.href='test-loader.html?category=${param}'"><span class="icon">${
      icons[param] || "❓"
    }</span><br>${cat}</div>`;
  });

  // Replace the <!-- Tiles populated dynamically --> comment
  const prerenderedMainHtml = template.replace(
    '    <div id="testGrid" class="test-grid">\n      <!-- Tiles populated dynamically -->\n    </div>',
    `    <div id="testGrid" class="test-grid">\n      ${categoryTiles.replace(
      /\$/g,
      "$$$$"
    )}\n    </div>`
  );

  // Write prerendered version for main
  await fs.writeFile("test-loader-prerendered.html", prerenderedMainHtml);

  // For each category, generate prerendered version
  for (const cat of categories) {
    const param = cat.toLowerCase().replace(/[^a-z0-9]+/g, "");
    try {
      const quizData = await fs.readFile(`tests/${param}/list.json`, "utf8");
      const { list: quizTitles, listJSON: quizFiles } = JSON.parse(quizData);
      let quizItems = "";
      quizTitles.forEach((title, index) => {
        const filename = quizFiles[index];
        quizItems += `<div class="test-list-item" onclick="window.location.href='quiz.html?category=${param}&test=${filename}'">${title}</div>`;
      });

      const categoryHtml = template
        .replace(
          '    <div id="testGrid" class="test-grid">\n      <!-- Tiles populated dynamically -->\n    </div>',
          `    <div id="testGrid" class="test-list">\n      ${quizItems.replace(
            /\$/g,
            "$$$$"
          )}\n    </div>`
        )
        .replace(
          '<h2><span id="categoryName">All Categories</span></h2>',
          `<h2><span id="categoryName">${cat}</span></h2>`
        )
        .replace(
          '<div id="backBtnContainer" style="margin-top: 2rem; display: none;">',
          '<div id="backBtnContainer" style="margin-top: 2rem;">'
        );

      await fs.writeFile(`test-loader-${param}-prerendered.html`, categoryHtml);

      console.log(`Prerendered category: ${param}`);
    } catch (e) {
      console.error(`Failed to prerender category: ${param}`, e.message);
    }
  }

  console.log("Prerendering complete.");
}

prerender().catch(console.error);
