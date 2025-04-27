// === FINAL CLEAN PATCH FOR UTIL.JS (IQ FIX + DATA PASSING) ===

let quizData;
let currentIndex = 0;
let userAnswers = [];

async function loadQuiz() {
  const params = new URLSearchParams(window.location.search);
  const category = params.get('category');
  const test = params.get('test');

  if (!category || !test) {
    showError('Missing quiz parameters.');
    return;
  }

  const quizPath = `tests/${category}/${test}`;

  try {
    const response = await fetch(quizPath);
    if (!response.ok) throw new Error('Quiz file not found.');

    quizData = await response.json();

    if (!quizData || !Array.isArray(quizData.questions) || quizData.questions.length === 0) {
      throw new Error('Invalid quiz data.');
    }

    startQuiz(quizData);
  } catch (error) {
    console.error('Error loading quiz:', error);
    showError('Failed to load quiz.');
  }
}

function startQuiz(data) {
  quizData = data;
  console.log('Starting quiz:', quizData);

  const quizLoading = document.getElementById('quiz-loading');
  if (quizLoading) quizLoading.style.display = 'none';

  const quizContainer = document.getElementById('quizContainer');
  if (quizContainer) quizContainer.style.display = 'block';

  document.getElementById('quiz-title').textContent = quizData.title || 'Quiz Loaded';

  renderQuestion();

  document.getElementById('nextBtn').onclick = () => {
    const selected = document.querySelector('input[name="option"]:checked');
    if (!selected) {
      alert('Please select an option before continuing.');
      return;
    }
    userAnswers[currentIndex] = parseInt(selected.value, 10);
    currentIndex++;
    renderQuestion();
  };

  document.getElementById('prevBtn').onclick = () => {
    currentIndex--;
    renderQuestion();
  };

  document.getElementById('submitBtn').onclick = () => {
    const selected = document.querySelector('input[name="option"]:checked');
    if (!selected) {
      alert('Please select an option before submitting.');
      return;
    }
    userAnswers[currentIndex] = parseInt(selected.value, 10);

    localStorage.setItem('quizResults', JSON.stringify({
      title: quizData.title,
      questions: quizData.questions,
      scoringType: quizData.scoringType,
      resultMapping: quizData.resultMapping || null,
      userAnswers: userAnswers
    }));

    window.location.href = 'results.html';
  };
}

function renderQuestion() {
  const questionObj = quizData.questions[currentIndex];

  if (!questionObj) {
    console.error('No question found at index:', currentIndex);
    showError('No more questions available.');
    return;
  }

  const questionEl = document.getElementById('question');
  const optionsEl = document.getElementById('options');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const submitBtn = document.getElementById('submitBtn');

  questionEl.textContent = questionObj.question;
  optionsEl.innerHTML = '';

  questionObj.choices.forEach((choice, index) => {
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.justifyContent = 'center';
    wrapper.style.margin = '8px 0';

    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'option';
    input.value = index;
    input.style.marginRight = '10px';
    input.style.transform = 'scale(1.5)';

    const label = document.createElement('label');
    label.style.fontSize = '1.2rem';
    label.style.color = 'white';
    label.style.cursor = 'pointer';
    label.textContent = choice;

    wrapper.appendChild(input);
    wrapper.appendChild(label);
    optionsEl.appendChild(wrapper);
  });

  if (userAnswers[currentIndex] !== undefined) {
    const selectedOption = optionsEl.querySelectorAll('input')[userAnswers[currentIndex]];
    if (selectedOption) selectedOption.checked = true;
  }

  prevBtn.style.display = currentIndex > 0 ? 'inline-block' : 'none';
  nextBtn.style.display = currentIndex < quizData.questions.length - 1 ? 'inline-block' : 'none';
  submitBtn.style.display = currentIndex === quizData.questions.length - 1 ? 'inline-block' : 'none';
}

async function loadResults() {
  const storedResult = localStorage.getItem('quizResults');
  if (!storedResult) {
    showError('No quiz result found.');
    return;
  }

  const resultData = JSON.parse(storedResult);
  document.getElementById('result-title').textContent = `Quiz Completed: ${resultData.title}`;

  const desc = document.getElementById('result-description');

  if (resultData.scoringType === 'score') {
  const correctCount = resultData.userAnswers.reduce((count, answer, idx) => {
    return count + (answer === resultData.questions[idx].answerIndex ? 1 : 0);
  }, 0);

  const percentage = correctCount / resultData.questions.length;
  let resultText = `You scored ${correctCount} out of ${resultData.questions.length}.`;

  if (resultData.resultMapping && resultData.resultMapping.score) {
    if (percentage >= 0.8) {
      resultText = resultData.resultMapping.score.high;
    } else if (percentage >= 0.5) {
      resultText = resultData.resultMapping.score.medium;
    } else {
      resultText = resultData.resultMapping.score.low;
    }
  }

  desc.textContent = resultText;
} else if (resultData.scoringType === 'iq') {
    const correct = resultData.userAnswers.reduce((count, answer, idx) => {
      return count + (answer === resultData.questions[idx].answerIndex ? 1 : 0);
    }, 0);
    const iqScore = 80 + Math.round(correct / resultData.questions.length * 60);
    desc.textContent = `Your estimated Galactic IQ: ${iqScore}!`;
  } else if (resultData.scoringType === 'category') {
    const categoryScores = {};

    resultData.userAnswers.forEach((answer, index) => {
      const weights = resultData.questions[index].weights[answer];
      const category = Object.keys(weights)[0];
      const value = weights[category];

      if (!categoryScores[category]) {
        categoryScores[category] = 0;
      }
      categoryScores[category] += value;
    });

    let bestCategory = null;
    let bestScore = -Infinity;
    for (const cat in categoryScores) {
      if (categoryScores[cat] > bestScore) {
        bestCategory = cat;
        bestScore = categoryScores[cat];
      }
    }

    const finalRole = resultData.resultMapping && resultData.resultMapping.categoryMapping
      ? resultData.resultMapping.categoryMapping[bestCategory]
      : bestCategory;

    desc.textContent = `You are best suited for the role: ${finalRole}!`;
  } else {
    desc.textContent = 'Results calculated.';
  }
}

function showError(msg) {
  document.body.innerHTML = `
    <h1 style="color: white; text-align: center; margin-top: 20%">${msg}</h1>
    <div style="text-align:center; margin-top:20px;">
      <a href="test-loader.html" style="color:cyan;">← Back to Tests</a>
    </div>
  `;
}

window.loadQuiz = loadQuiz;
window.startQuiz = startQuiz;
window.loadResults = loadResults;
window.showError = showError;