// FULL CLEAN PATCH for Util.js

// Load a Quiz JSON and start it
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

    const quizData = await response.json();

    if (!quizData || !quizData.questions) {
      throw new Error('Quiz data invalid.');
    }

    startQuiz(quizData);
  } catch (error) {
    console.error('Error loading quiz:', error);
    showError('Failed to load quiz.');
  }
}

// Start the quiz once loaded
function startQuiz(quizData) {
  console.log("Starting quiz:", quizData);

  const quizLoading = document.getElementById('quiz-loading');
  if (quizLoading) quizLoading.style.display = 'none';

  const quizContainer = document.getElementById('quizContainer');
  if (quizContainer) quizContainer.style.display = 'block';

  const quizTitle = document.getElementById('quiz-title');
  const questionEl = document.getElementById('question');
  const optionsEl = document.getElementById('options');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const submitBtn = document.getElementById('submitBtn');

  let currentIndex = 0;
  let userAnswers = [];

  if (!quizData || !Array.isArray(quizData.questions) || quizData.questions.length === 0) {
    showError("Quiz data is missing or invalid.");
    return;
  }

  quizTitle.textContent = quizData.title || "Quiz Loaded";

  function renderQuestion() {
    const questionObj = quizData.questions[currentIndex];

    if (!questionObj) {
      console.error("No question found at index:", currentIndex);
      showError("No more questions available.");
      return;
    }

    questionEl.textContent = questionObj.question;
    optionsEl.innerHTML = '';

    questionObj.choices.forEach((choice, index) => {
      const label = document.createElement('label');
      label.style.display = 'block';
      label.style.margin = '10px 0';
      label.style.fontSize = '1.2rem';
      label.style.color = 'white';

      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'option';
      input.value = index;
      input.style.marginRight = '8px';

      label.appendChild(input);
      label.appendChild(document.createTextNode(choice));
      optionsEl.appendChild(label);
    });

    if (userAnswers[currentIndex] !== undefined) {
      const selectedOption = optionsEl.querySelectorAll('input')[userAnswers[currentIndex]];
      if (selectedOption) selectedOption.checked = true;
    }

    prevBtn.style.display = currentIndex > 0 ? 'inline-block' : 'none';
    nextBtn.style.display = currentIndex < quizData.questions.length - 1 ? 'inline-block' : 'none';
    submitBtn.style.display = currentIndex === quizData.questions.length - 1 ? 'inline-block' : 'none';
  }

  nextBtn.onclick = () => {
    const selected = optionsEl.querySelector('input[name="option"]:checked');
    if (!selected) {
      alert('Please select an option before continuing.');
      return;
    }
    userAnswers[currentIndex] = parseInt(selected.value, 10);
    currentIndex++;
    renderQuestion();
  };

  prevBtn.onclick = () => {
    currentIndex--;
    renderQuestion();
  };

  submitBtn.onclick = () => {
    const selected = optionsEl.querySelector('input[name="option"]:checked');
    if (!selected) {
      alert('Please select an option before submitting.');
      return;
    }
    userAnswers[currentIndex] = parseInt(selected.value, 10);

    localStorage.setItem('quizResults', JSON.stringify({
      title: quizData.title,
      questions: quizData.questions,
      scoringType: quizData.scoringType,
      userAnswers: userAnswers
    }));

    window.location.href = 'results.html';
  };

  renderQuestion();
}

// Load results page after quiz submission
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
    desc.textContent = `You scored ${correctCount} out of ${resultData.questions.length}.`;
  } else if (resultData.scoringType === 'iq') {
    const correct = resultData.userAnswers.reduce((count, answer, idx) => {
      return count + (answer === resultData.questions[idx].answerIndex ? 1 : 0);
    }, 0);
    const iqScore = 80 + Math.round(correct / resultData.questions.length * 60);
    desc.textContent = `Your estimated Galactic IQ: ${iqScore}!`;
  } else {
    desc.textContent = "Results calculated.";
  }
}

// Show an error if something critical fails
function showError(msg) {
  document.body.innerHTML = `
    <h1 style="color: white; text-align: center; margin-top: 20%;">${msg}</h1>
    <div style="text-align:center; margin-top:20px;">
      <a href="test-loader.html" style="color:cyan;">← Back to Tests</a>
    </div>
  `;
}

// Expose to window
window.loadQuiz = loadQuiz;
window.startQuiz = startQuiz;
window.loadResults = loadResults;
window.showError = showError;
