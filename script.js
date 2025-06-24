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
        
        learningPathEl.innerHTML = `
            <h3>Your Personalized Strategy Path</h3>
            <p>Based on your profile, we recommend these articles for skill development:</p>
            <div>${getLearningPath(type).map(article => `<a href="${article.url}" target="_blank" class="path-button">${article.title}</a>`).join('')}</div>
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
            case 'Strategic User': return { title: "Strategic User", description: "You view AI as a partner, not a replacement. You skillfully delegate low-level tasks, freeing up your mental energy to focus on what truly matters: critical analysis, creativity, and developing original arguments.", strengths: ["Effective Delegation", "Enhanced Critical Thinking", "High Integrity & Confidence"], pitfalls: ["Potential for Complacency", "Missing Mentorship Opportunities"] };
            case 'Over-reliant Learner': return { title: "Over-reliant Learner", description: "You are resourceful, pragmatic, and highly focused on results. You see AI as the ultimate tool to overcome tight deadlines, but this can risk compromising the depth of your learning and the originality of your voice.", strengths: ["Incredible Speed", "High Productivity", "Resourceful with Tools"], pitfalls: ["Loss of Original Voice", "Reduced Critical Engagement", "Vulnerability to AI Errors"] };
            default: return { title: "Regular User", description: "You are balanced and practical, using AI to improve your work and save time. You are comfortable with the technology but sometimes blur the line between using it as a helpful assistant and letting it take over critical tasks.", strengths: ["Good Balance of Speed/Quality", "Adaptable to New Tools", "Generally Efficient"], pitfalls: ["Inconsistent Strategy", "Risk of Leaning into Over-reliance", "Occasional Lack of Deep Analysis"] };
        }
    }

    function getLearningPath(type) {
        switch (type) {
            case 'Strategic User': return [ { title: "Advanced Prompt Engineering for Research", url: "https://new.library.arizona.edu/tutorials/guide-prompting-ai-academic-research" }, { title: "Using AI for Socratic Debate to Test Arguments", url: "https://www.aiforeducation.io/post/use-chatgpt-as-a-socratic-partner-to-improve-your-critical-thinking" } ];
            case 'Over-reliant Learner': return [ { title: "The Art of the First Draft (Without AI)", url: "https://writingcenter.unc.edu/tips-and-tools/getting-started/" }, { title: "How to Critically Fact-Check AI Outputs", url: "https://www.poynter.org/fact-checking/2023/how-to-fact-check-ai-generated-text-like-a-journalist/" } ];
            default: return [ { title: "Defining Clear Boundaries for AI Use", url: "https://www.bu.edu/dli/how-to-use-ai-tools-responsibly/" }, { title: "Verifying AI-suggested Sources and Citations", url: "https://lib.uwaterloo.ca/user-guides/style-guides/fact-checking-and-verifying-information-generative-ai" } ];
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
        if (overReliantPercent > 40) { insightTextEl.innerHTML = `<strong>High Alert:</strong> A significant portion (${overReliantPercent.toFixed(0)}%) of students in the <strong>${discipline}</strong> category are 'Over-reliant Learners'. Intervention and policy review are recommended.`; } 
        else if (counts['Strategic User'] > counts['Regular User']) { insightTextEl.innerHTML = `<strong>Positive Trend:</strong> A majority of students in <strong>${discipline}</strong> are 'Strategic Users', indicating healthy and effective AI adoption. This group could serve as mentors.`; } 
        else if (highestProfile) { insightTextEl.innerHTML = `<strong>Observation:</strong> The '<strong>${highestProfile}</strong>' profile has the highest average Dependency Index. Efforts could be focused on providing targeted guidance to this group within the <strong>${discipline}</strong> discipline.`; } 
        else { insightTextEl.textContent = "Data is being analyzed. Please check back."; }
    }

    // --- REVISED: Data-Driven Policy Engine Logic ---
    policyBuilderForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const currentDiscipline = dashboardFilter.value;

        // Get the currently filtered data to make the policy data-driven
        const filteredData = currentDiscipline === 'All' ? surveySubmissions : surveySubmissions.filter(sub => sub.discipline === currentDiscipline);
        
        let profileCounts = { 'Strategic User': 0, 'Regular User': 0, 'Over-reliant Learner': 0 };
        filteredData.forEach(sub => profileCounts[sub.type]++);
        const total = filteredData.length;
        const overReliantPercent = total > 0 ? (profileCounts['Over-reliant Learner'] / total) * 100 : 0;
        const strategicPercent = total > 0 ? (profileCounts['Strategic User'] / total) * 100 : 0;

        // Generate the policy
        let policyText = `**AI Usage Policy Recommendation for ${currentDiscipline}**\n\n`;
        policyText += "Principle: Our goal is to leverage AI as a tool for enhancing learning, not replacing critical thought. This policy recommendation is based on UNESCO guidance and is tailored to the current usage patterns observed in this student population.\n\n";

        // Generate policy based on data patterns
        if (overReliantPercent > 40) {
            // High-risk group, recommend a "Corrective Action" policy
            policyText += `**Data-Driven Alert:** Our data shows a high percentage (${overReliantPercent.toFixed(0)}%) of "Over-reliant" usage in this group. A stricter policy is recommended to reinforce academic integrity.\n\n`;
            policyText += "1. **Prohibited Use:** Direct submission of AI-generated text or complex problem solutions is considered a serious violation of academic integrity.\n";
            policyText += "2. **Mandatory Disclosure:** All use of AI tools for brainstorming, summarizing, or editing must be explicitly disclosed in an appendix.\n";
            policyText += "3. **Focus on Verification:** Assessments will include components that require students to defend and explain the logic and sources behind their work.";

        } else if (strategicPercent > 50) {
            // High-achieving group, recommend a "Strategic Enhancement" policy
            policyText += `**Data-Driven Insight:** Our data shows a majority (${strategicPercent.toFixed(0)}%) of students in this group are "Strategic Users." The policy should focus on leveraging this strength.\n\n`;
            policyText += "1. **Encouraged Use:** Students are encouraged to use AI tools for advanced tasks like Socratic debate, testing code, and summarizing complex research.\n";
            policy_text += "2. **Peer Mentorship:** \"AI Strategists\" may be invited to lead workshops for their peers on ethical and effective AI use.\n";
            policyText += "3. **Requirement:** All submissions must include a brief reflection on how AI tools were used to enhance the learning process.";

        } else {
            // Balanced group, recommend a "Standard Balanced" policy
            policyText += `**Data-Driven Insight:** The usage patterns in this group are balanced. A standard policy focusing on clarity and ethical boundaries is recommended.\n\n`;
            policyText += "1. **Permitted Use:** AI tools may be used for brainstorming, summarizing research, checking grammar, and rephrasing.\n";
            policyText += "2. **Prohibited Use:** Submitting AI-generated text as one's own original work is prohibited. Students must be able to explain their work's process.\n";
            policyText += "3. **Emphasis on Citation:** All ideas, facts, or sources provided by an AI must be independently verified and properly cited.";
        }
        
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