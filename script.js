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
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinksContainer = document.querySelector('.nav-links');

    const toggleMobileMenu = () => {
        mobileMenuToggle.classList.toggle('open');
        navLinksContainer.classList.toggle('active');
    };

    mobileMenuToggle.addEventListener('click', toggleMobileMenu);

    const switchTab = (tab) => {
        const sections = [ideaSection, gpaSection, timerSection];
        const navLinks = [navIdea, navGpa, navTimer];
        
        sections.forEach(s => {
            s.classList.add('hidden');
            s.classList.remove('fade-in');
        });
        navLinks.forEach(l => l.classList.remove('active'));

        let targetSection;
        if (tab === 'idea') {
            ideaSection.classList.remove('hidden');
            setTimeout(() => ideaSection.classList.add('fade-in'), 10);
            navIdea.classList.add('active');
            targetSection = ideaSection;
        } else if (tab === 'gpa') {
            gpaSection.classList.remove('hidden');
            setTimeout(() => gpaSection.classList.add('fade-in'), 10);
            navGpa.classList.add('active');
            targetSection = gpaSection;
        } else {
            timerSection.classList.remove('hidden');
            setTimeout(() => timerSection.classList.add('fade-in'), 10);
            navTimer.classList.add('active');
            targetSection = timerSection;
        }

        // Move the view specifically to the target section
        if (targetSection) {
            targetSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }

        // Close mobile menu after selection
        mobileMenuToggle.classList.remove('open');
        navLinksContainer.classList.remove('active');
    };

    navIdea.addEventListener('click', (e) => { e.preventDefault(); switchTab('idea'); });
    navGpa.addEventListener('click', (e) => { e.preventDefault(); switchTab('gpa'); });
    navTimer.addEventListener('click', (e) => { e.preventDefault(); switchTab('timer'); });

    // --- Toast Notification System ---
    const showToast = (message, title = "Error", type = "error") => {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        // Prevent duplicate toasts with the same message
        const existingToasts = Array.from(container.querySelectorAll('.toast'));
        const isDuplicate = existingToasts.some(t => {
            const p = t.querySelector('p');
            return p && p.textContent === message;
        });

        if (isDuplicate) return;

        // Limit maximum number of toasts to 3
        if (existingToasts.length >= 3) {
            existingToasts[0].remove();
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icons = {
            error: "⚠️",
            warning: "🔔",
            success: "✅",
            info: "ℹ️"
        };

        toast.innerHTML = `
            <div class="toast-icon">${icons[type] || "⚠️"}</div>
            <div class="toast-content">
                <h4>${title}</h4>
                <p>${message}</p>
            </div>
        `;

        container.appendChild(toast);

        // Auto remove after 4 seconds
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 400);
        }, 4000);
    };

    // --- Custom Confirm Modal ---
    const showConfirmModal = (message, onConfirm) => {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        
        overlay.innerHTML = `
            <div class="modal-content">
                <h3>Delete Confirmation</h3>
                <p>${message}</p>
                <div class="modal-actions">
                    <button class="btn-secondary cancel-modal">Cancel</button>
                    <button class="btn-primary confirm-modal">Delete</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        const closeBtn = overlay.querySelector('.cancel-modal');
        const confirmBtn = overlay.querySelector('.confirm-modal');

        const closeModal = () => {
            overlay.classList.add('fade-out'); // Add a fade out if needed or just remove
            setTimeout(() => overlay.remove(), 200);
        };

        closeBtn.addEventListener('click', closeModal);
        confirmBtn.addEventListener('click', () => {
            onConfirm();
            closeModal();
        });

        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });
    };

    // --- Idea Board Logic ---
    const addIdeaBtn = document.getElementById('add-idea-btn');
    const aiSummarizeBtn = document.getElementById('ai-summarize-btn');
    const ideaInput = document.getElementById('idea-input');
    const ideaList = document.getElementById('idea-list');
    const charCounter = document.getElementById('char-counter');
    const inputContainer = document.querySelector('.input-with-counter');

    // Update character counter
    const updateCharCounter = () => {
        const length = ideaInput.value.length;
        charCounter.textContent = `${length} / 200`;
        
        if (length > 200) {
            charCounter.classList.add('limit-exceeded');
        } else {
            charCounter.classList.remove('limit-exceeded');
        }
    };

    ideaInput.addEventListener('input', updateCharCounter);

    // Load ideas from localStorage on page load
    const loadIdeas = () => {
        const savedIdeas = JSON.parse(localStorage.getItem('ideas')) || [];
        savedIdeas.forEach(ideaText => {
            const li = createIdeaElement(ideaText);
            ideaList.appendChild(li);
        });
    };

    const saveIdea = (ideaText) => {
        const savedIdeas = JSON.parse(localStorage.getItem('ideas')) || [];
        savedIdeas.push(ideaText);
        localStorage.setItem('ideas', JSON.stringify(savedIdeas));
    };

    const deleteIdeaFromStorage = (ideaText) => {
        let savedIdeas = JSON.parse(localStorage.getItem('ideas')) || [];
        savedIdeas = savedIdeas.filter(idea => idea !== ideaText);
        localStorage.setItem('ideas', JSON.stringify(savedIdeas));
    };

    const updateIdeaInStorage = (oldText, newText) => {
        let savedIdeas = JSON.parse(localStorage.getItem('ideas')) || [];
        const index = savedIdeas.indexOf(oldText);
        if (index !== -1) {
            savedIdeas[index] = newText;
            localStorage.setItem('ideas', JSON.stringify(savedIdeas));
        }
    };

    const createIdeaElement = (ideaText) => {
        const li = document.createElement('li');
        
        const renderDefault = () => {
            li.innerHTML = `
                <span class="idea-text">${ideaText}</span>
                <div class="idea-actions">
                    <button class="btn-icon edit-btn" title="Edit Idea">✏️</button>
                    <button class="btn-icon delete-btn" title="Delete Idea">🗑️</button>
                </div>
            `;

            li.querySelector('.delete-btn').addEventListener('click', () => {
                showConfirmModal("Are you sure you want to delete this comment?", () => {
                    deleteIdeaFromStorage(ideaText);
                    li.remove();
                    showToast("Idea deleted successfully.", "Deleted", "info");
                });
            });

            li.querySelector('.edit-btn').addEventListener('click', () => {
                renderEditMode();
            });
        };

        const renderEditMode = () => {
            li.innerHTML = `
                <div class="edit-mode-container">
                    <input type="text" class="edit-input" value="${ideaText}">
                    <div class="edit-actions">
                        <button class="btn-secondary ai-edit-btn">✨ AI Summarize</button>
                        <button class="btn-secondary cancel-btn">Cancel</button>
                        <button class="btn-primary save-btn">Save</button>
                    </div>
                </div>
            `;

            const editInput = li.querySelector('.edit-input');
            const aiBtn = li.querySelector('.ai-edit-btn');
            const cancelBtn = li.querySelector('.cancel-btn');
            const saveBtn = li.querySelector('.save-btn');

            aiBtn.addEventListener('click', async () => {
                const text = editInput.value.trim();
                if (!text) return;
                
                aiBtn.disabled = true;
                aiBtn.innerHTML = `<span class="spinner"></span>...`;
                const summarized = await summarizeWithAI(text);
                editInput.value = summarized;
                aiBtn.disabled = false;
                aiBtn.innerHTML = `✨ AI Summarize`;
            });

            cancelBtn.addEventListener('click', () => {
                renderDefault();
            });

            saveBtn.addEventListener('click', async () => {
                let newText = editInput.value.trim();
                
                if (newText === "") {
                    showToast("Idea cannot be empty.", "Empty Input");
                    return;
                }

                // Check for HTML tags or programming-like syntax
                const tagRegex = /<[^>]*>/g;
                const restrictedCharsRegex = /[<>{}[\]\\|^~]/;

                if (tagRegex.test(newText)) {
                    showToast("HTML tags are not allowed.", "Security Warning", "error");
                    return;
                }

                if (restrictedCharsRegex.test(newText)) {
                    showToast("Special programming characters are not allowed.", "Invalid Characters", "error");
                    return;
                }

                // Automatic character limit check (200 characters)
                if (newText.length > 200) {
                    showToast("Maximum characters (200) exceeded! Summarizing...", "Character Limit", "warning");
                    
                    saveBtn.disabled = true;
                    aiBtn.disabled = true;
                    const originalBtnText = saveBtn.textContent;
                    saveBtn.innerHTML = `<span class="spinner"></span>...`;
                    
                    try {
                        newText = await summarizeWithAI(newText);
                    } catch (error) {
                        showToast("Summarization failed.", "AI Error");
                        return;
                    } finally {
                        saveBtn.disabled = false;
                        aiBtn.disabled = false;
                        saveBtn.textContent = originalBtnText;
                    }
                }

                if (newText === ideaText) {
                    renderDefault();
                    return;
                }

                updateIdeaInStorage(ideaText, newText);
                ideaText = newText;
                renderDefault();
                showToast("Idea updated successfully.", "Updated", "success");
            });
        };

        renderDefault();
        return li;
    };

    // Function to sanitize text (remove tags and restricted characters)
    const sanitizeText = (text) => {
        const tagRegex = /<[^>]*>/g;
        const restrictedCharsRegex = /[<>{}[\]\\|^~]/g;
        return text.replace(tagRegex, "").replace(restrictedCharsRegex, "");
    };

    // Simulated Professional AI Summarization function
    const summarizeWithAI = async (text) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                let processed = text.trim();
                
                // 1. Remove common "filler" conversational starts
                const fillers = [
                    /^i (think|believe|suggest) (we should|that) /i,
                    /^maybe (we can|we should|it would be good to) /i,
                    /^how about /i,
                    /^i want to /i,
                    /^we need to /i
                ];
                
                fillers.forEach(regex => {
                    processed = processed.replace(regex, "");
                });

                // 2. Professional Mapping (Simulated Semantic Understanding)
                const professionalMapping = [
                    { keywords: ["make", "create", "build"], replacement: "Develop" },
                    { keywords: ["help", "support"], replacement: "Facilitate" },
                    { keywords: ["share", "give"], replacement: "Distribute" },
                    { keywords: ["talk", "chat"], replacement: "Communicate" },
                    { keywords: ["idea", "thought"], replacement: "Concept" },
                    { keywords: ["notes", "study"], replacement: "Academic Resources" }
                ];

                // Capitalize first letter
                processed = processed.charAt(0).toUpperCase() + processed.slice(1);

                // 3. Summarization Logic
                let summary;
                if (processed.length > 120) {
                    // Extract first meaningful sentence or clause
                    const firstPart = processed.split(/[.!?]/)[0];
                    summary = firstPart.length > 100 ? firstPart.substring(0, 100) + "..." : firstPart;
                    
                    // Add professional concluding context if it was very long
                    if (!summary.endsWith(".")) summary += ".";
                    summary = "Proposed: " + summary;
                } else if (processed.length > 40) {
                    summary = processed.charAt(0).toUpperCase() + processed.slice(1);
                    if (!summary.endsWith(".")) summary += ".";
                } else {
                    summary = processed;
                }
                
                resolve(sanitizeText(summary));
            }, 2000);
        });
    };

    const handleManualSummarize = async () => {
        const text = ideaInput.value.trim();
        if (text === "") {
            showToast("Please enter some text to summarize.", "Empty Input");
            return;
        }

        // Trigger animations
        inputContainer.classList.add('ai-summarizing');
        aiSummarizeBtn.disabled = true;
        const originalBtnText = aiSummarizeBtn.innerHTML;
        aiSummarizeBtn.innerHTML = `<span class="spinner"></span> Thinking...`;

        try {
            const summarizedText = await summarizeWithAI(text);
            ideaInput.value = summarizedText;
            updateCharCounter();
            showToast("AI has successfully summarized your text.", "Summary Ready", "success");
        } catch (error) {
            showToast("AI failed to process. Please try again.", "AI Error");
        } finally {
            inputContainer.classList.remove('ai-summarizing');
            aiSummarizeBtn.disabled = false;
            aiSummarizeBtn.innerHTML = originalBtnText;
        }
    };

    const handleAddIdea = async () => {
        let ideaValue = ideaInput.value.trim();

        if (ideaValue === "") {
            showToast("Please enter an idea before clicking add.", "Empty Input");
            return;
        }

        // Check for HTML tags or programming-like syntax
        const tagRegex = /<[^>]*>/g;
        const restrictedCharsRegex = /[<>{}[\]\\|^~]/;

        if (tagRegex.test(ideaValue)) {
            showToast("HTML tags are not allowed in ideas.", "Security Warning", "error");
            return;
        }

        if (restrictedCharsRegex.test(ideaValue)) {
            showToast("Special programming characters (like { } [ ] \\ | ^ ~) are not allowed.", "Invalid Characters", "error");
            return;
        }

        // Automatic character limit check (200 characters)
        if (ideaValue.length > 200) {
            showToast("Maximum characters (200) exceeded! Using Cloud AI to summarize...", "Character Limit", "warning");
            
            // Disable buttons and show loading state
            addIdeaBtn.disabled = true;
            aiSummarizeBtn.disabled = true;
            inputContainer.classList.add('ai-summarizing');
            
            const originalBtnText = addIdeaBtn.textContent;
            addIdeaBtn.innerHTML = `<span class="spinner"></span> AI processing...`;
            
            try {
                ideaValue = await summarizeWithAI(ideaValue);
                showToast("Your idea has been automatically summarized.", "AI Summary Complete", "success");
            } catch (error) {
                showToast("AI summarization failed. Please try a shorter idea.", "AI Error");
                return;
            } finally {
                inputContainer.classList.remove('ai-summarizing');
                addIdeaBtn.disabled = false;
                aiSummarizeBtn.disabled = false;
                addIdeaBtn.textContent = originalBtnText;
            }
        }

        // Check if idea already exists (case-insensitive and trimmed)
        const existingIdeas = Array.from(ideaList.querySelectorAll('li'))
            .map(li => li.textContent.trim().toLowerCase());

        if (existingIdeas.includes(ideaValue.toLowerCase())) {
            showToast("The idea already exists! Please enter a new idea.", "Duplicate Idea");
            return;
        }

        const li = createIdeaElement(ideaValue);
        ideaList.appendChild(li);
        
        // Save to localStorage
        saveIdea(ideaValue);
        
        // Clear input field and reset counter
        ideaInput.value = "";
        updateCharCounter();
    };

    // Initialize ideas
    loadIdeas();

    addIdeaBtn.addEventListener('click', handleAddIdea);
    aiSummarizeBtn.addEventListener('click', handleManualSummarize);

    // Allow adding idea by pressing Enter key
    ideaInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleAddIdea();
        }
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
    const testSoundBtn = document.getElementById('timer-test-sound');
    const typeBtns = document.querySelectorAll('.timer-type');

    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
    }

    // Function to show browser notification
    const showNotification = (message) => {
        if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Study Timer", {
                body: message,
                icon: "https://ucsc.cmb.ac.lk/new-site/wp-content/themes/university/images/ucsc-logo.png"
            });
        }
    };

    // Function to play a metallic bell-like notification sound
    const playNotificationSound = () => {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            
            const playTone = (freq, vol, duration, type = 'sine') => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = type;
                osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
                gain.gain.setValueAtTime(vol, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start();
                osc.stop(audioCtx.currentTime + duration);
            };

            // Bell-like harmonic structure (tubular bell style)
            playTone(440, 0.4, 3, 'sine');    // Fundamental A4
            playTone(880, 0.2, 2, 'sine');    // A5
            playTone(1320, 0.15, 1.5, 'sine'); // E6
            playTone(1760, 0.1, 1, 'sine');    // A6
            playTone(2093, 0.05, 0.8, 'sine'); // C7
            
            // Initial "strike" component
            playTone(440, 0.1, 0.05, 'square'); 
        } catch (e) {
            console.warn("Audio context failed. Ensure you have interacted with the page.", e);
        }
    };

    testSoundBtn.addEventListener('click', playNotificationSound);

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
                
                const activeBtn = document.querySelector('.timer-type.active');
                const modeName = activeBtn ? activeBtn.textContent.split(' (')[0] : "Session";
                const message = `${modeName} complete! Time for a change.`;
                
                playNotificationSound();
                showNotification(message);
                
                setTimeout(() => {
                    alert(message);
                }, 100);
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
