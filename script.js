document.addEventListener('DOMContentLoaded', () => {
    // --- Dark Mode Logic ---
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    
    const enableDarkMode = () => {
        document.body.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'enabled');
        darkModeToggle.checked = true;
    };

    const disableDarkMode = () => {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('darkMode', 'disabled');
        darkModeToggle.checked = false;
    };

    // Check for saved user preference
    if (localStorage.getItem('darkMode') === 'enabled') {
        enableDarkMode();
    }

    darkModeToggle.addEventListener('change', () => {
        if (darkModeToggle.checked) {
            enableDarkMode();
        } else {
            disableDarkMode();
        }
    });

    // --- Navigation Logic ---
    const navIdea = document.getElementById('nav-idea');
    const navGpa = document.getElementById('nav-gpa');
    const navTimer = document.getElementById('nav-timer');
    const ideaSection = document.getElementById('idea-section');
    const gpaSection = document.getElementById('gpa-section');
    const timerSection = document.getElementById('timer-section');

    const switchTab = (tab) => {
        const sections = [ideaSection, gpaSection, timerSection];
        const navLinks = [navIdea, navGpa, navTimer];
        
        sections.forEach(s => {
            s.classList.add('hidden');
            s.classList.remove('fade-in');
        });
        navLinks.forEach(l => l.classList.remove('active'));

        if (tab === 'idea') {
            ideaSection.classList.remove('hidden');
            setTimeout(() => ideaSection.classList.add('fade-in'), 10);
            navIdea.classList.add('active');
        } else if (tab === 'gpa') {
            gpaSection.classList.remove('hidden');
            setTimeout(() => gpaSection.classList.add('fade-in'), 10);
            navGpa.classList.add('active');
        } else {
            timerSection.classList.remove('hidden');
            setTimeout(() => timerSection.classList.add('fade-in'), 10);
            navTimer.classList.add('active');
        }
    };

    navIdea.addEventListener('click', (e) => { e.preventDefault(); switchTab('idea'); });
    navGpa.addEventListener('click', (e) => { e.preventDefault(); switchTab('gpa'); });
    navTimer.addEventListener('click', (e) => { e.preventDefault(); switchTab('timer'); });

    // --- Idea Board Logic ---
    const addIdeaBtn = document.getElementById('add-idea-btn');
    const ideaInput = document.getElementById('idea-input');
    const ideaList = document.getElementById('idea-list');

    addIdeaBtn.addEventListener('click', () => {
        const idea = ideaInput.value.trim();

        if (idea === "") {
            alert("Please enter an idea.");
            return;
        }

        const li = document.createElement('li');
        li.textContent = idea;
        
        ideaList.appendChild(li);
        
        // Clear idea input
        ideaInput.value = "";
    });

    // --- GPA Calculator Logic ---
    const courseList = document.getElementById('course-list');
    const addCourseBtn = document.getElementById('add-course');
    const calculateGpaBtn = document.getElementById('calculate-gpa');
    const gpaResult = document.getElementById('gpa-result');
    const gpaValue = document.getElementById('gpa-value');
    const gpaMessage = document.getElementById('gpa-message');

    const gradePoints = {
        'A+': 4.0, 'A': 4.0, 'A-': 3.7,
        'B+': 3.3, 'B': 3.0, 'B-': 2.7,
        'C+': 2.3, 'C': 2.0, 'C-': 1.7,
        'D+': 1.3, 'D': 1.0, 'F': 0.0
    };

    const createCourseRow = () => {
        const row = document.createElement('div');
        row.className = 'course-row';
        row.innerHTML = `
            <input type="text" placeholder="e.g. Mathematics" class="course-name">
            <input type="number" placeholder="Credits" class="course-credits" min="0" step="0.5">
            <select class="course-grade">
                <option value="">Grade</option>
                ${Object.keys(gradePoints).map(g => `<option value="${g}">${g}</option>`).join('')}
            </select>
            <button class="btn-remove">&times;</button>
        `;

        row.querySelector('.btn-remove').addEventListener('click', () => {
            row.remove();
        });

        return row;
    };

    // Add 3 initial rows
    for (let i = 0; i < 3; i++) {
        courseList.appendChild(createCourseRow());
    }

    addCourseBtn.addEventListener('click', () => {
        courseList.appendChild(createCourseRow());
    });

    calculateGpaBtn.addEventListener('click', () => {
        const credits = document.querySelectorAll('.course-credits');
        const grades = document.querySelectorAll('.course-grade');
        
        let totalPoints = 0;
        let totalCredits = 0;

        credits.forEach((creditInput, index) => {
            const credit = parseFloat(creditInput.value);
            const grade = grades[index].value;

            if (!isNaN(credit) && grade !== "") {
                totalCredits += credit;
                totalPoints += (credit * gradePoints[grade]);
            }
        });

        if (totalCredits > 0) {
            const gpa = (totalPoints / totalCredits).toFixed(2);
            gpaValue.textContent = gpa;
            gpaResult.classList.remove('hidden');

            if (gpa >= 3.5) gpaMessage.textContent = "Excellent work! Keep it up.";
            else if (gpa >= 3.0) gpaMessage.textContent = "Great job! You're doing well.";
            else if (gpa >= 2.0) gpaMessage.textContent = "Good effort. Focus on improving.";
            else gpaMessage.textContent = "Keep working hard!";
            
            // Scroll to result on mobile
            gpaResult.scrollIntoView({ behavior: 'smooth' });
        } else {
            alert("Please enter credits and grades for at least one course.");
        }
    });

    // --- Study Timer Logic ---
    let timerInterval;
    let timeLeft = 25 * 60; // 25 minutes default
    let isRunning = false;

    const timeLeftDisplay = document.getElementById('time-left');
    const startBtn = document.getElementById('timer-start');
    const pauseBtn = document.getElementById('timer-pause');
    const resetBtn = document.getElementById('timer-reset');
    const typeBtns = document.querySelectorAll('.timer-type');

    // Function to play a notification sound
    const playNotificationSound = () => {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
            gainNode.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 0.1);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1);

            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 1);
        } catch (e) {
            console.log("Audio not supported or blocked");
        }
    };

    const updateDisplay = () => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timeLeftDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.title = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} - Student Toolkit`;
    };

    const startTimer = () => {
        if (isRunning) return;
        isRunning = true;
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        
        timerInterval = setInterval(() => {
            timeLeft--;
            updateDisplay();

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                isRunning = false;
                startBtn.disabled = false;
                playNotificationSound();
                alert("Time's up! Take a break.");
            }
        }, 1000);
    };

    const pauseTimer = () => {
        clearInterval(timerInterval);
        isRunning = false;
        startBtn.disabled = false;
        pauseBtn.disabled = true;
    };

    const resetTimer = () => {
        pauseTimer();
        const activeBtn = document.querySelector('.timer-type.active');
        timeLeft = parseInt(activeBtn.dataset.time) * 60;
        updateDisplay();
        startBtn.disabled = false;
        pauseBtn.disabled = true;
    };

    typeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            typeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            timeLeft = parseInt(btn.dataset.time) * 60;
            updateDisplay();
            pauseTimer();
        });
    });

    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', resetTimer);

    // Initialize timer display
    updateDisplay();
    pauseBtn.disabled = true;
});
