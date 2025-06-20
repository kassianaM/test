document.addEventListener('DOMContentLoaded', function() {
    // --- Global State & Elements ---
    const navStudent = document.getElementById('navStudent');
    const navInstitution = document.getElementById('navInstitution');
    const studentView = document.getElementById('studentView');
    const institutionalView = document.getElementById('institutionalView');
    const analyzerForm = document.getElementById('analyzerForm');
    const studentResultEl = document.getElementById('studentResult');
    
    // Dashboard Elements
    const submissionCountEl = document.getElementById('submissionCount');
    const dashboardFilter = document.getElementById('dashboardFilter');
    const insightTextEl = document.getElementById('insightText');
    const policyBuilderForm = document.getElementById('policyBuilderForm');
    const policyOutput = document.getElementById('policyOutput');
    let adoptionChart, learnerProfileChart;

    // --- Real-Time Data Simulation ---
    let surveySubmissions = [
        { index: 8, type: 'Strategic User', discipline: 'STEM' }, { index: 12, type: 'Regular User', discipline: 'STEM' },
        { index: 35, type: 'Over-reliant Learner', discipline: 'STEM' }, { index: 28, type: 'Over-reliant Learner', discipline: 'Humanities' },
        { index: 7, type: 'Strategic User', discipline: 'Humanities' }, { index: 18, type: 'Regular User', discipline: 'Humanities' },
        { index: 15, type: 'Regular User', discipline: 'Business' }, { index: 22, type: 'Regular User', discipline: 'Business' },
    ];

    // --- Navigation Logic ---
    function showView(viewToShow) {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
        viewToShow.classList.add('active');
        if(viewToShow.id === 'studentView') {
            navStudent.classList.add('active');
        } else {
            navInstitution.classList.add('active');
        }
    }
    navStudent.addEventListener('click', () => showView(studentView));
    navInstitution.addEventListener('click', () => {
        showView(institutionalView);
        updateDashboard();
    });

    // --- Main Form Submission Logic ---
    analyzerForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const calculationData = calculateIndex();
        if (calculationData === null) return; 
        const { score, frequency, tasks } = calculationData;
        const learnerType = classifyLearner(score);
        displayFullAnalysis(score, learnerType, frequency, tasks);
        studentResultEl.classList.remove('hidden');
        const discipline = document.getElementById('disciplineSelect').value;
        surveySubmissions.push({ index: score, type: learnerType, discipline: discipline });
    });

    // --- Main Display Function ---
    function displayFullAnalysis(score, type, frequency, tasks) {
        const diagnosisEl = document.getElementById('diagnosis');
        const breakdownEl = document.getElementById('breakdownSection');
        const interpretationEl = document.getElementById('interpretation');
        const learningPathEl = document.getElementById('learningPath');
        const interpretationData = getInterpretation(type);
        
        diagnosisEl.innerHTML = `<h3>Your AI Usage Profile</h3><p><strong>Your Dependency Index Score:</strong> ${score}</p><p><strong>Your Profile:</strong> ${interpretationData.title}</p><button id="breakdownButton" class="action-button" style="background-color:#7f8c8d; font-size:0.9em; padding: 8px 15px;">Show Score Breakdown</button>`;
        interpretationEl.innerHTML = `<p>${interpretationData.description}</p><div class="strengths-pitfalls"><div><strong>Key Strengths:</strong><ul>${interpretationData.strengths.map(s => `<li>${s}</li>`).join('')}</ul></div><div><strong>Potential Pitfalls:</strong><ul>${interpretationData.pitfalls.map(p => `<li>${p}</li>`).join('')}</ul></div></div>`;
        
        // UPDATED: Now includes the "Path to Excellence" paragraph
        learningPathEl.innerHTML = `
            <h3>Your Personalized Strategy Path</h3>
            <p>Based on your profile, we recommend these articles for skill development:</p>
            <div>${getLearningPath(type).map(article => `<a href="${article.url}" target="_blank" class="path-button">${article.title}</a>`).join('')}</div>
            <div id="excellencePath">
                <h4>Your Path to Excellence:</h4>
                <p><strong>To excel without AI,</strong> ${interpretationData.excel_advice.without_ai}</p>
                <p><strong>To excel with AI,</strong> ${interpretationData.excel_advice.with_ai}</p>
            </div>
        `;
        
        const taskComplexityScore = tasks.reduce((sum, task) => sum + task.value, 0);
        breakdownEl.innerHTML = `<h4>Your Score Calculation:</h4><p>Usage Frequency Multiplier: <strong>x${frequency}</strong></p><p>Task Complexity Score: <strong>${taskComplexityScore}</strong></p><ul>${tasks.map(task => `<li>${task.name}: +${task.value}</li>`).join('')}</ul><p><strong>Final Score: ${frequency} × ${taskComplexityScore} = ${score}</strong></p>`;
        breakdownEl.classList.add('hidden');
        
        document.getElementById('breakdownButton').addEventListener('click', () => {
            breakdownEl.classList.toggle('hidden');
        });
    }

    // --- Content Functions ---
    function getInterpretation(type) {
        switch (type) {
            case 'Strategic User': return {
                title: "Strategic User",
                description: "You view AI as a partner, not a replacement. You skillfully delegate low-level tasks, freeing up your mental energy to focus on what truly matters: critical analysis, creativity, and developing original arguments.",
                strengths: ["Effective Delegation", "Enhanced Critical Thinking", "High Integrity & Confidence"],
                pitfalls: ["Potential for Complacency", "Missing Mentorship Opportunities"],
                excel_advice: {
                    without_ai: "focus on mentoring others. Teaching your strategies to peers is the best way to solidify your own expertise and become a leader in academic integrity.",
                    with_ai: "push the boundaries by using it for meta-cognition. Ask AI to 'act as a skeptical reviewer of my thesis' or 'identify potential logical fallacies in my argument' to elevate your work to a professional level."
                }
            };
            case 'Over-reliant Learner': return {
                title: "Over-reliant Learner",
                description: "You are resourceful, pragmatic, and highly focused on results. You see AI as the ultimate tool to overcome tight deadlines, but this can risk compromising the depth of your learning and the originality of your voice.",
                strengths: ["Incredible Speed", "High Productivity", "Resourceful with Tools"],
                pitfalls: ["Loss of Original Voice", "Reduced Critical Engagement", "Vulnerability to AI Errors"],
                excel_advice: {
                    without_ai: "practice writing 'zero-stakes' first drafts on paper. The goal is not to be perfect, but to build confidence in your own ability to generate ideas and structure arguments from scratch.",
                    with_ai: "shift your usage from 'generation' to 'refinement'. Write your draft first, then use AI as a sophisticated proofreader or to suggest alternative phrasing, always keeping your original thoughts at the core."
                }
            };
            default: return { // Regular User
                title: "Regular User",
                description: "You are balanced and practical, using AI to improve your work and save time. You are comfortable with the technology but sometimes blur the line between using it as a helpful assistant and letting it take over critical tasks.",
                strengths: ["Good Balance of Speed/Quality", "Adaptable to New Tools", "Generally Efficient"],
                pitfalls: ["Inconsistent Strategy", "Risk of Leaning into Over-reliance", "Occasional Lack of Deep Analysis"],
                excel_advice: {
                    without_ai: "challenge yourself to complete one full academic assignment per month with zero AI assistance. This will help you benchmark your fundamental skills and identify areas where you truly need support.",
                    with_ai: "become more intentional. Before using an AI tool, state a clear, limited goal, such as 'I will only use this tool to generate three counter-arguments,' to build discipline and prevent unintentional over-use."
                }
            };
        }
    }

    function getLearningPath(type) {
        switch (type) {
            case 'Strategic User': return [
                { title: "Advanced Prompt Engineering for Research", url: "https://new.library.arizona.edu/tutorials/guide-prompting-ai-academic-research" }, 
                { title: "Using AI for Socratic Debate to Test Arguments", url: "https://www.aiforeducation.io/post/use-chatgpt-as-a-socratic-partner-to-improve-your-critical-thinking" }
            ];
            case 'Over-reliant Learner': return [
                { title: "The Art of the First Draft (Without AI)", url: "https://writingcenter.unc.edu/tips-and-tools/getting-started/" }, 
                { title: "How to Critically Fact-Check AI Outputs", url: "https://www.poynter.org/fact-checking/2023/how-to-fact-check-ai-generated-text-like-a-journalist/" }
            ];
            default: return [ // Regular User
                { title: "Defining Clear Boundaries for AI Use", url: "https://www.bu.edu/dli/how-to-use-ai-tools-responsibly/" }, 
                { title: "Verifying AI-suggested Sources and Citations", url: "https://lib.uwaterloo.ca/user-guides/style-guides/fact-checking-and-verifying-information-generative-ai" }
            ];
        }
    }

    // --- Helper Functions ---
    function calculateIndex() {
        const frequency = parseInt(document.getElementById('frequency').value);
        const taskCheckboxes = document.querySelectorAll('input[name="task"]:checked');
        if (taskCheckboxes.length === 0) { alert("Please select at least one task."); return null; }
        const tasks = Array.from(taskCheckboxes).map(cb => ({ name: cb.parentElement.textContent.trim(), value: parseInt(cb.value) }));
        const taskComplexityScore = tasks.reduce((sum, task) => sum + task.value, 0);
        return { score: frequency * taskComplexityScore, frequency: frequency, tasks: tasks };
    }

    function classifyLearner(index) {
        if (index < 15) return "Strategic User";
        if (index < 30) return "Regular User";
        return "Over-reliant Learner";
    }

    // --- Institutional Dashboard Logic ---
    dashboardFilter.addEventListener('change', updateDashboard);
    
    function updateDashboard() {
        const selectedDiscipline = dashboardFilter.value;
        const filteredData = selectedDiscipline === 'All' ? surveySubmissions : surveySubmissions.filter(sub => sub.discipline === selectedDiscipline);
        submissionCountEl.textContent = `${filteredData.length} submissions`;
        const profileCounts = { 'Strategic User': 0, 'Regular User': 0, 'Over-reliant Learner': 0 };
        const indexSums = { 'Strategic User': 0, 'Regular User': 0, 'Over-reliant Learner': 0 };
        filteredData.forEach(sub => { profileCounts[sub.type]++; indexSums[sub.type] += sub.index; });
        const avgIndex = { strategic: profileCounts['Strategic User'] > 0 ? (indexSums['Strategic User'] / profileCounts['Strategic User']).toFixed(1) : 0, regular: profileCounts['Regular User'] > 0 ? (indexSums['Regular User'] / profileCounts['Regular User']).toFixed(1) : 0, overReliant: profileCounts['Over-reliant Learner'] > 0 ? (indexSums['Over-reliant Learner'] / profileCounts['Over-reliant Learner']).toFixed(1) : 0 };
        learnerProfileChart.data.datasets[0].data = Object.values(profileCounts);
        adoptionChart.data.datasets[0].data = [avgIndex.strategic, avgIndex.regular, avgIndex.overReliant];
        learnerProfileChart.update();
        adoptionChart.update();
        generateInsight(filteredData, profileCounts, selectedDiscipline);
    }
    
    function generateInsight(data, counts, discipline) {
        if (data.length < 3) { insightTextEl.textContent = "More data is needed to generate a reliable insight for this filter."; return; }
        const total = data.length;
        const overReliantPercent = (counts['Over-reliant Learner'] / total) * 100;
        const dataValues = adoptionChart.data.datasets[0].data.map(val => parseFloat(val)).filter(v => !isNaN(v) && v > 0);
        if (dataValues.length === 0) { insightTextEl.textContent = "No average index data to analyze."; return; }
        const highestAvgValue = Math.max(...dataValues);
        const highestProfileIndex = adoptionChart.data.datasets[0].data.findIndex(val => parseFloat(val) === highestAvgValue);
        const highestProfile = adoptionChart.data.labels[highestProfileIndex];

        if (overReliantPercent > 40) {
            insightTextEl.innerHTML = `<strong>High Alert:</strong> A significant portion (${overReliantPercent.toFixed(0)}%) of students in the <strong>${discipline}</strong> category are 'Over-reliant Learners'. Intervention and policy review are recommended.`;
        } else if (counts['Strategic User'] > counts['Regular User']) {
            insightTextEl.innerHTML = `<strong>Positive Trend:</strong> A majority of students in <strong>${discipline}</strong> are 'Strategic Users', indicating healthy and effective AI adoption. This group could serve as mentors.`;
        } else if (highestProfile) {
            insightTextEl.innerHTML = `<strong>Observation:</strong> The '<strong>${highestProfile}</strong>' profile has the highest average Dependency Index. Efforts could be focused on providing targeted guidance to this group within the <strong>${discipline}</strong> discipline.`;
        } else {
             insightTextEl.textContent = "Data is being analyzed. Please check back.";
        }
    }

    policyBuilderForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const discipline = document.getElementById('policyDiscipline').value;
        const strictness = document.getElementById('strictness').value;
        let policyText = `**AI Usage Policy for ${discipline}**\n\n`;
        if (strictness === 'Permissive') policyText += "Students are encouraged to use AI tools for brainstorming, drafting, and revision. Full disclosure of tools used is required in an appendix.";
        else if (strictness === 'Balanced') policyText += "AI tools may be used for brainstorming, research summarization, and grammar checks. AI-generated text may not be submitted as original work. Students must be able to explain the entire process of their work.";
        else policyText += "The use of generative AI for creating any part of a submitted assignment is prohibited and will be treated as academic dishonesty. AI may only be used for basic proofreading after the work is complete.";
        policyOutput.querySelector('pre').textContent = policyText;
        policyOutput.classList.remove('hidden');
    });

    function initializeCharts() {
        const chart1Ctx = document.getElementById('chart1').getContext('2d');
        learnerProfileChart = new Chart(chart1Ctx, { type: 'doughnut', data: { labels: ['Strategic Users', 'Regular Users', 'Over-reliant Learners'], datasets: [{ data: [], backgroundColor: ['#2c3e50', '#3498db', '#a9cce3'] }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } } } });
        const chart2Ctx = document.getElementById('chart2').getContext('2d');
        adoptionChart = new Chart(chart2Ctx, { type: 'bar', data: { labels: ['Strategic', 'Regular', 'Over-reliant'], datasets: [{ label: 'Average Dependency Index', data: [], backgroundColor: 'rgba(52, 152, 219, 0.7)' }] }, options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } } } });
    }
    
    // --- Initial Setup ---
    function initialize() {
        initializeCharts();
        updateDashboard();
        showView(studentView);
    }
    
    initialize();
});