document.addEventListener('DOMContentLoaded', () => {
            
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });
    
    const navLinks = document.querySelectorAll('.nav-link, #mobile-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (!mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
            }
        });
    });

    const sections = document.querySelectorAll('section');
    const mainNavLinks = document.querySelectorAll('nav .nav-link');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                mainNavLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href').substring(1) === entry.target.id);
                });
            }
        });
    }, { rootMargin: "-50% 0px -50% 0px" });
    sections.forEach(section => observer.observe(section));

    const infoCards = document.querySelectorAll('[data-info]');
    infoCards.forEach(card => {
        card.addEventListener('click', () => {
            const infoId = card.dataset.info;
            const infoElement = document.getElementById(`${infoId}-info`);
            if (infoElement) {
                const isHidden = infoElement.classList.contains('hidden');
                document.querySelectorAll('[id$="-info"]').forEach(el => el.classList.add('hidden'));
                if (isHidden) {
                    infoElement.classList.remove('hidden');
                }
            }
        });
    });

    let energyPyramidChart;
    const energySlider = document.getElementById('energy-slider');
    const energyValue = document.getElementById('energy-value');
    
    function createEnergyPyramid() {
        const ctx = document.getElementById('energyPyramidChart').getContext('2d');
        const initialEnergy = parseFloat(energySlider.value);
        const data = {
            labels: ['생산자', '1차 소비자', '2차 소비자', '3차 소비자'],
            datasets: [{
                label: '에너지 양 (kcal)',
                data: [
                    initialEnergy, 
                    initialEnergy * 0.1, 
                    initialEnergy * 0.01, 
                    initialEnergy * 0.001
                ],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(255, 159, 64, 0.6)',
                    'rgba(255, 99, 132, 0.6)'
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(255, 99, 132, 1)'
                ],
                borderWidth: 1
            }]
        };

        energyPyramidChart = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `에너지: ${context.raw.toFixed(1)} kcal`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: { display: true, text: '에너지 양 (kcal)' },
                        ticks: {
                            callback: function(value, index, values) {
                                return value > 1000 ? `${value/1000}k` : value;
                            }
                        }
                    }
                }
            }
        });
    }

    function updateEnergyPyramid() {
        const newEnergy = parseFloat(energySlider.value);
        energyValue.textContent = newEnergy;
        energyPyramidChart.data.datasets[0].data = [
            newEnergy,
            newEnergy * 0.1,
            newEnergy * 0.01,
            newEnergy * 0.001
        ];
        energyPyramidChart.update();
    }

    energySlider.addEventListener('input', updateEnergyPyramid);
    createEnergyPyramid();

    let predatorPreyChart;
    let simulationData = {
        labels: [],
        rabbits: [],
        foxes: []
    };
    let time = 0;
    let simulationInterval;

    function createPredatorPreyChart() {
        const ctx = document.getElementById('predatorPreyChart').getContext('2d');
        predatorPreyChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: simulationData.labels,
                datasets: [
                    {
                        label: '토끼 (피식자)',
                        data: simulationData.rabbits,
                        borderColor: 'rgb(54, 162, 235)',
                        backgroundColor: 'rgba(54, 162, 235, 0.5)',
                        tension: 0.1
                    },
                    {
                        label: '여우 (포식자)',
                        data: simulationData.foxes,
                        borderColor: 'rgb(255, 99, 132)',
                        backgroundColor: 'rgba(255, 99, 132, 0.5)',
                        tension: 0.1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: '개체 수' }
                    },
                    x: {
                        title: { display: true, text: '시간' }
                    }
                }
            }
        });
    }

    function runSimulationStep() {
        const lastRabbits = simulationData.rabbits[simulationData.rabbits.length - 1];
        const lastFoxes = simulationData.foxes[simulationData.foxes.length - 1];
        
        const growthRate = 0.1;
        const predationRate = 0.002;
        const foxGrowthRate = 0.001;
        const foxDeathRate = 0.05;

        let newRabbits = lastRabbits + (lastRabbits * growthRate) - (lastRabbits * lastFoxes * predationRate);
        let newFoxes = lastFoxes + (lastRabbits * lastFoxes * foxGrowthRate) - (lastFoxes * foxDeathRate);

        newRabbits = Math.max(0, newRabbits);
        newFoxes = Math.max(0, newFoxes);

        time++;
        simulationData.labels.push(time);
        simulationData.rabbits.push(newRabbits);
        simulationData.foxes.push(newFoxes);

        if (simulationData.labels.length > 50) {
            simulationData.labels.shift();
            simulationData.rabbits.shift();
            simulationData.foxes.shift();
        }

        predatorPreyChart.update();
    }

    function startSimulation() {
        if (simulationInterval) clearInterval(simulationInterval);
        simulationData = {
            labels: [0],
            rabbits: [1000],
            foxes: [50]
        };
        time = 0;
        predatorPreyChart.data.labels = simulationData.labels;
        predatorPreyChart.data.datasets[0].data = simulationData.rabbits;
        predatorPreyChart.data.datasets[1].data = simulationData.foxes;
        predatorPreyChart.update();
        simulationInterval = setInterval(runSimulationStep, 500);
    }

    createPredatorPreyChart();
    startSimulation();

    document.getElementById('reset-simulation').addEventListener('click', startSimulation);
    document.getElementById('add-foxes').addEventListener('click', () => {
        simulationData.foxes[simulationData.foxes.length - 1] += 50;
        predatorPreyChart.update();
    });
    document.getElementById('rabbit-disease').addEventListener('click', () => {
        simulationData.rabbits[simulationData.rabbits.length - 1] *= 0.3;
        predatorPreyChart.update();
    });

    const quizData = [
        {
            question: "광합성을 통해 스스로 양분을 만드는 생물은 무엇일까요?",
            options: ["소비자", "생산자", "분해자", "비생물적 요인"],
            answer: "생산자"
        },
        {
            question: "먹이 사슬을 따라 상위 영양 단계로 갈수록 에너지 양은 어떻게 변할까요?",
            options: ["증가한다", "일정하다", "감소한다", "관계없다"],
            answer: "감소한다"
        },
        {
            question: "죽은 생물이나 배설물을 분해하여 물질을 자연으로 되돌리는 역할은?",
            options: ["생산자", "소비자", "분해자", "포식자"],
            answer: "분해자"
        },
        {
            question: "다음 중 생태계 교란의 인위적 요인이 아닌 것은?",
            options: ["산불", "서식지 파괴", "환경 오염", "외래종 유입"],
            answer: "산불"
        }
    ];
    const quizContainer = document.getElementById('quiz-container');
    let currentQuestionIndex = 0;
    let score = 0;

    function showQuestion() {
        const q = quizData[currentQuestionIndex];
        quizContainer.innerHTML = `
            <p class="font-bold text-lg mb-4">${currentQuestionIndex + 1}. ${q.question}</p>
            <div class="space-y-2">
                ${q.options.map(option => `
                    <button class="quiz-option block w-full text-left p-3 bg-gray-100 hover:bg-green-100 rounded-lg">${option}</button>
                `).join('')}
            </div>
            <div id="quiz-feedback" class="mt-4"></div>
        `;

        document.querySelectorAll('.quiz-option').forEach(button => {
            button.addEventListener('click', handleAnswer);
        });
    }

    function handleAnswer(e) {
        const selectedOption = e.target.textContent;
        const correctAnswer = quizData[currentQuestionIndex].answer;
        const feedbackEl = document.getElementById('quiz-feedback');
        
        document.querySelectorAll('.quiz-option').forEach(btn => {
            btn.disabled = true;
            if (btn.textContent === correctAnswer) {
                btn.classList.add('bg-green-200');
            }
        });

        if (selectedOption === correctAnswer) {
            score++;
            feedbackEl.innerHTML = `<p class="text-green-600 font-bold">정답입니다!</p>`;
        } else {
            e.target.classList.add('bg-red-200');
            feedbackEl.innerHTML = `<p class="text-red-600 font-bold">오답입니다. 정답은 '${correctAnswer}' 입니다.</p>`;
        }

        feedbackEl.innerHTML += `<button id="next-question" class="btn-primary px-4 py-2 rounded-lg mt-4">다음 문제</button>`;
        document.getElementById('next-question').addEventListener('click', () => {
            currentQuestionIndex++;
            if (currentQuestionIndex < quizData.length) {
                showQuestion();
            } else {
                showResults();
            }
        });
    }

    function showResults() {
        quizContainer.innerHTML = `
            <h3 class="text-2xl font-bold text-center mb-4">퀴즈 완료!</h3>
            <p class="text-center text-lg">총 ${quizData.length}문제 중 <span class="font-bold text-green-700">${score}</span>문제를 맞혔습니다.</p>
            <div class="text-center mt-6">
                <button id="restart-quiz" class="btn-primary px-6 py-3 rounded-lg font-semibold">다시 풀기</button>
            </div>
        `;
        document.getElementById('restart-quiz').addEventListener('click', () => {
            currentQuestionIndex = 0;
            score = 0;
            showQuestion();
        });
    }

    showQuestion();
});