// Util.js

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

function showError(msg) {
  document.body.innerHTML = `
    <h1 style="color: white; text-align: center; margin-top: 20%;">${msg}</h1>
    <div style="text-align:center; margin-top:20px;">
      <a href="test-loader.html" style="color:cyan;">← Back to Tests</a>
    </div>
  `;
}

function startQuiz(quizData) {
  const quizTitle = document.getElementById('quiz-title');
  const questionEl = document.getElementById('question');
  const optionsEl = document.getElementById('options');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const submitBtn = document.getElementById('submitBtn');

  document.getElementById('quizContainer').style.display = 'block';

  let currentIndex = 0;
  let userAnswers = [];

  quizTitle.textContent = quizData.title || "Quiz";

  function renderQuestion() {
    const questionObj = quizData.questions[currentIndex];
    questionEl.textContent = questionObj.question;
    optionsEl.innerHTML = '';

    questionObj.choices.forEach((choice, index) => {
      const label = document.createElement('label');
      label.innerHTML = `
        <input type="radio" name="option" value="${index}">
        ${choice}
      `;
      optionsEl.appendChild(label);
    });

    if (userAnswers[currentIndex] !== undefined) {
      optionsEl.querySelectorAll('input')[userAnswers[currentIndex]].checked = true;
    }

    prevBtn.style.display = currentIndex > 0 ? 'inline-block' : 'none';
    nextBtn.style.display = currentIndex < quizData.questions.length - 1 ? 'inline-block' : 'none';
    submitBtn.style.display = currentIndex === quizData.questions.length - 1 ? 'inline-block' : 'none';
  }

  nextBtn.addEventListener('click', () => {
    const selected = optionsEl.querySelector('input[name="option"]:checked');
    if (!selected) {
      alert('Please select an option.');
      return;
    }
    userAnswers[currentIndex] = parseInt(selected.value);
    currentIndex++;
    renderQuestion();
  });

  prevBtn.addEventListener('click', () => {
    currentIndex--;
    renderQuestion();
  });

  submitBtn.addEventListener('click', () => {
    const selected = optionsEl.querySelector('input[name="option"]:checked');
    if (!selected) {
      alert('Please select an option.');
      return;
    }
    userAnswers[currentIndex] = parseInt(selected.value);

    localStorage.setItem('quizResults', JSON.stringify({
      title: quizData.title,
      questions: quizData.questions,
      scoringType: quizData.scoringType,
      userAnswers: userAnswers
    }));

    window.location.href = 'results.html';
  });

  renderQuestion();
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
