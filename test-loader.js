// test-loader.js

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

const params = new URLSearchParams(window.location.search);
const category = params.get('category');
const categoryNameEl = document.getElementById('categoryName');
const testGrid = document.getElementById('testGrid');
const backBtnContainer = document.getElementById('backBtnContainer');

if (!category) {
  categoryNameEl.textContent = 'All Categories';
  testGrid.className = 'test-grid'; // show tiles
  const categories = ['Apocalypse', 'Government', 'Horror', 'Intelligence', 'Meme', 'Pop', 'Rock', 'Sci-Fi'];

  categories.forEach(cat => {
    const tile = document.createElement('div');
    tile.className = 'test-card';
    const icons = { apocalypse: '☢️', government: '🏛️', horror: '🧟', intelligence: '🧠',
    meme: '😹', pop: '🎤', rock: '🎸', scifi: '👽'};

    const param = cat.toLowerCase().replace(/[^a-z0-9]+/g, '');
    tile.innerHTML = `<span class="icon">${icons[param] || '❓'}</span><br>${cat}`;

    tile.onclick = () => {
      const param = cat.toLowerCase().replace(/[^a-z0-9]+/g, '');
      window.location.href = `test-loader.html?category=${param}`;
    };
    testGrid.appendChild(tile);
  });

  backBtnContainer.style.display = 'none';

} else {
  categoryNameEl.textContent = capitalize(category);
  testGrid.className = 'test-list'; // vertical list

  const mockTests = {
    intelligence: ['Are You Smarter Than a Bot?', 'IQ Calibration Test', 'Logic Blitz'],
    horror: ['Would You Survive the Zombie Apocalypse?', 'Cursed Object Identifier'],
    pop: ['Which 2000s Icon Are You?', 'Viral Trend Timeline'],
    apocalypse: ['Post-Nuke Personality Scan', 'Doomsday Prepper Quiz'],
    rock: ['What Rockstar Are You?', 'Classic Rock IQ'],
    government: ['How Well Do You Know the System?', 'Conspiracy Filter Test'],
    meme: ['Dank Level Analyzer', 'Which Meme Archetype Are You?'],
    scifi: ['Spaceship Pilot Readiness', 'Alien Detection Capability'],
    random: ['Surprise Test 1', 'Mystery Challenge']
  };

  const tests = mockTests[category] || [];

  if (tests.length === 0) {
    testGrid.innerHTML = '<p>No tests found in this category yet.</p>';
  } else {
    tests.forEach(testName => {
      const item = document.createElement('div');
      item.className = 'test-list-item'; // use the correct item class
      item.textContent = testName;
      item.onclick = () => {
        const fileName = testName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.html';
        window.location.href = `tests/${category}/${fileName}`;
      };
      testGrid.appendChild(item);
    });
  }

  backBtnContainer.style.display = 'block';
}
