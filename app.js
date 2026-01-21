
// DOM Elements
const gridContainer = document.getElementById('grid-container');
const searchInput = document.getElementById('search-input');
const modal = document.getElementById('detail-modal');
const modalTitle = document.getElementById('modal-title');
const modalIcon = document.getElementById('modal-icon');
const modalBody = document.getElementById('modal-body');

let currentView = 'home';

/**
 * Initialize Dashboard
 */
function initDashboard() {
    setupNav();
    renderView();
}

/**
 * Setup Navigation Event Listeners
 */
function setupNav() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            currentView = item.dataset.view;

            // Adjust search placeholder based on view
            if (currentView === 'standards') {
                searchInput.placeholder = "성취기준 또는 키워드 검색...";
            } else if (currentView === 'books') {
                searchInput.placeholder = "도서명, 저자 또는 성취기준 검색...";
            } else {
                searchInput.placeholder = "내용 검색...";
            }

            renderView(searchInput.value);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
}

/**
 * Render appropriate view
 */
function renderView(filterQuery = '') {
    if (currentView === 'home') {
        renderHomeView();
    } else if (currentView === 'standards') {
        renderGrid(filterQuery);
    } else if (currentView === 'contents') {
        renderContentView(filterQuery);
    } else if (currentView === 'gane') {
        renderGagneView();
    } else if (currentView === 'books') {
        renderBooksView(filterQuery);
    } else if (currentView === 'strategy') {
        renderStrategyView();
    } else {
        renderInfoView(currentView === 'teaching' ? 'teachingLearning' : 'evaluation', filterQuery);
    }
}

/**
 * Render Libicki Reading Strategy View (Structured with strategy.ttl)
 */
function renderStrategyView(filterQuery = '') {
    gridContainer.innerHTML = '';

    const section = document.createElement('section');
    section.className = 'topic-section strategy-view';

    // Get all unique books
    const allBooks = [];
    const seenTitles = new Set();
    Object.values(curriculumBooks).flat().forEach(book => {
        if (!seenTitles.has(book.title)) {
            allBooks.push(book);
            seenTitles.add(book.title);
        }
    });

    section.innerHTML = `
        <div class="topic-header text-center">
            <div class="strategy-badge">Lucky Vicky Educational System</div>
            <h2><i class="fa-solid fa-graduation-cap"></i> ${readingStrategyData.title}</h2>
            <p style="color: var(--text-muted); margin-top: 0.5rem;">${readingStrategyData.subtitle}</p>
        </div>

        <div class="strategy-interactive-panel">
            <div class="book-chooser">
                <label for="book-select-strategy"><i class="fa-solid fa-book"></i> 대상 도서 선택</label>
                <select id="book-select-strategy" class="custom-select">
                    <option value="">-- 읽을 책을 선택하세요 --</option>
                    ${allBooks.map(b => `<option value="${b.title}">${b.title}</option>`).join('')}
                </select>
            </div>

            <div id="strategy-guide-content" class="strategy-guide-content empty-state">
                <div class="selection-prompt">
                    <i class="fa-solid fa-arrow-pointer"></i>
                    <p>도서를 선택하면 리비키 독서 전략에 기반한<br>맞춤형 활동 가이드를 확인하실 수 있습니다.</p>
                </div>
            </div>
        </div>
    `;

    gridContainer.appendChild(section);

    const selector = document.getElementById('book-select-strategy');
    selector.addEventListener('change', (e) => {
        const bookTitle = e.target.value;
        const book = allBooks.find(b => b.title === bookTitle);
        updateStrategyGuide(book);
    });
}

function updateStrategyGuide(book) {
    const container = document.getElementById('strategy-guide-content');
    if (!book) {
        container.innerHTML = `
            <div class="selection-prompt">
                <i class="fa-solid fa-arrow-pointer"></i>
                <p>도서를 선택하면 리비키 독서 전략에 기반한<br>맞춤형 활동 가이드를 확인하실 수 있습니다.</p>
            </div>
        `;
        container.classList.add('empty-state');
        return;
    }

    container.classList.remove('empty-state');

    // Tailor tips based on book tags
    const isReference = book.tags.includes('도감') || book.tags.includes('지권');
    const isNarrative = book.tags.includes('우주 이야기') || book.tags.includes('천문학');

    container.innerHTML = `
        <div class="selected-book-brief animate-in">
            <img src="${book.img}" alt="${book.title}" class="brief-img">
            <div class="brief-info">
                <span class="brief-author">${book.author}</span>
                <h3>${book.title}</h3>
                <p>${book.description}</p>
            </div>
        </div>

        <div class="strategy-process-flow">
            ${readingStrategyData.processes.map(proc => `
                <div class="proc-group-alt" style="--accent: ${proc.color}">
                    <div class="proc-header-alt">
                        <i class="fa-solid ${proc.icon}"></i>
                        <div class="proc-title-main">
                            <h4>${proc.label}</h4>
                            <span class="proc-step-tag">${getProcStepLabel(proc.id)}</span>
                        </div>
                    </div>
                    <div class="cog-strategies-grid">
                        ${proc.cognitiveStrategies.map(cog => `
                            <div class="cog-card-alt">
                                <h5>${cog.label}</h5>
                                <div class="strategy-options">
                                    ${cog.strategies.map(s => `<span class="opt-tag">${s}</span>`).join('')}
                                </div>
                                <div class="custom-tip">
                                    <i class="fa-solid fa-lightbulb"></i>
                                    <p>${getTailoredTip(cog.label, book.title, isReference, isNarrative)}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function getProcStepLabel(id) {
    const labels = { "BeforeReading": "준비하기", "DuringReading": "분석하기", "AfterReading": "종합하기" };
    return labels[id] || "";
}

function getTailoredTip(strategyLabel, title, isReference, isNarrative) {
    if (strategyLabel === "독서목적 명료화") {
        return isReference ? `'${title}'의 방대한 정보 중 오늘 내가 꼭 알아내야 할 정보(예: 행성의 특징)는 무엇인지 질문을 메모해보세요.` : `'${title}'을 통해 알고 싶은 천문학적 궁금증 3가지를 미리 적어봅시다.`;
    }
    if (strategyLabel === "사전지식활성화") {
        return `KWL 차트의 'K(Know)' 칸에 '${title}'을 읽기 전 이미 알고 있는 태양계나 우주 지식을 자유롭게 채워보세요.`;
    }
    if (strategyLabel === "추론/예측") {
        return isNarrative ? `제목과 차례를 보며 화자가 어떤 우주 여행 이야기를 들려줄지, 이어질 내용을 상상하며 읽어보세요.` : `그림과 사진 자료를 먼저 훑어보며, 이 사진이 설명하려는 과학적 원리가 무엇일지 예측해봅시다.`;
    }
    if (strategyLabel === "모니터링") {
        return `읽다가 이해가 되지 않는 용어(예: 연주시차, 복사평형)가 나오면 건너뛰지 말고 '생각 말하기'를 통해 다시 정리해보세요.`;
    }
    if (strategyLabel === "특정정보확인") {
        return isReference ? `비교가 필요한 데이터(예: 행성의 크기, 온도)는 텍스트에서 따로 발췌하여 차트로 정리하며 읽으세요.` : `작가가 강조하는 과학적 사실과 개인적인 소감을 구분하여 핵심 정보를 추출해보세요.`;
    }
    if (strategyLabel === "요약/종합") {
        return `읽기를 마친 후, '${title}'에서 새롭게 알게 된 사실을 마인드맵이나 그래픽 조직자로 시각화하여 내면화합시다.`;
    }
    return "이 책의 핵심 내용을 파악하기 위해 단계별 전략을 차근차근 적용해보세요.";
}

/**
 * Render Recommended Books View (Linked to Achievement Standards)
 */
/**
 * Render Recommended Books View (Grouped by Unit/Topic)
 */
function renderBooksView(filterQuery = '') {
    const query = filterQuery.toLowerCase();
    gridContainer.innerHTML = '';

    const section = document.createElement('section');
    section.className = 'topic-section books-view';

    let html = `
        <div class="topic-header text-center">
            <h2><i class="fa-solid fa-book-bookmark"></i> 단원별 추천도서</h2>
            <p style="color: var(--text-muted); margin-top: 0.5rem;">과학과 교육과정 단원 및 성취기준과 연계된 심화 독서 자원입니다.</p>
        </div>
        <div class="books-topics-flow">
    `;

    let totalBooksShown = 0;

    // Process Topics from curriculumData
    curriculumData.forEach(topic => {
        const topicBooks = [];
        const seenTitles = new Set();

        topic.standards.forEach(std => {
            const books = curriculumBooks[std.id] || [];
            books.forEach(book => {
                if (!seenTitles.has(book.title)) {
                    // Check search query
                    const matches = book.title.toLowerCase().includes(query) ||
                        book.author.toLowerCase().includes(query) ||
                        book.tags.some(t => t.toLowerCase().includes(query)) ||
                        topic.title.toLowerCase().includes(query);

                    if (matches) {
                        topicBooks.push({ ...book, stdCode: std.code });
                        seenTitles.add(book.title);
                    }
                }
            });
        });

        if (topicBooks.length > 0) {
            totalBooksShown += topicBooks.length;
            html += `
                <div class="topic-book-group animate-in">
                    <div class="group-header">
                        <span class="group-badge">Unit ${topic.id.replace('Topic', '')}</span>
                        <h3>${topic.title}</h3>
                    </div>
                    <div class="books-grid">
                        ${topicBooks.map(book => createBookCard(book)).join('')}
                    </div>
                </div>
            `;
        }
    });

    // Process "General" books
    const generalBooks = curriculumBooks["General"] || [];
    const filteredGeneral = generalBooks.filter(book =>
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.tags.some(t => t.toLowerCase().includes(query))
    );

    if (filteredGeneral.length > 0) {
        totalBooksShown += filteredGeneral.length;
        html += `
            <div class="topic-book-group animate-in">
                <div class="group-header">
                    <span class="group-badge">All</span>
                    <h3>과학 토론</h3>
                </div>
                <div class="books-grid">
                    ${filteredGeneral.map(book => createBookCard(book)).join('')}
                </div>
            </div>
        `;
    }

    html += `</div>`;
    section.innerHTML = html;

    if (totalBooksShown === 0) {
        renderEmptyState(filterQuery);
        return;
    }

    gridContainer.appendChild(section);
}

/**
 * Helper to create a book card HTML
 */
function createBookCard(book) {
    return `
        <article class="book-card">
            <div class="book-cover">
                <img src="${book.img}" alt="${book.title}" onerror="this.src='https://via.placeholder.com/150?text=No+Image'">
                <div class="book-category-badge">${book.stdCode || '공통'}</div>
            </div>
            <div class="book-info">
                <h3><a href="${book.url}" target="_blank" class="book-link">${book.title} <i class="fa-solid fa-arrow-up-right-from-square"></i></a></h3>
                <p class="book-author"><i class="fa-solid fa-user-pen"></i> ${book.author}</p>
                <p class="book-desc">${book.description}</p>
                <div class="book-tags">
                    ${book.tags.map(tag => `<span class="book-tag">#${tag}</span>`).join('')}
                </div>
            </div>
        </article>
    `;
}

/**
 * Render Gagne (Instructional Design) View
 */
function renderGagneView() {
    gridContainer.innerHTML = '';

    const section = document.createElement('section');
    section.className = 'topic-section gagne-planner';

    section.innerHTML = `
        <div class="topic-header">
            <h2><i class="fa-solid fa-wand-magic-sparkles"></i> 만능 가네: AI 수업 설계 도우미</h2>
            <p style="color: var(--text-muted); margin-top: 0.5rem;">성취기준을 선택하면 가네의 9가지 수업 사태에 맞춘 맞춤형 수업 지도안 초안을 생성합니다.</p>
        </div>

        <div class="planner-container">
            <div class="selector-panel">
                <div class="input-group">
                    <label><i class="fa-solid fa-bullseye"></i> 성취기준 선택</label>
                    <select id="std-selector" class="custom-select">
                        <option value="">-- 성취기준을 선택하세요 --</option>
                        ${curriculumData.flatMap(t => t.standards).map(s => `
                            <option value="${s.id}">${s.code} ${s.content.substring(0, 30)}...</option>
                        `).join('')}
                    </select>
                </div>
                <button id="generate-plan-btn" class="primary-btn">
                    <i class="fa-solid fa-gears"></i> 지도안 생성하기
                </button>
            </div>

            <div id="plan-display" class="plan-display hidden">
                <div class="plan-header">
                    <h3><i class="fa-solid fa-file-invoice"></i> 맞춤형 수업 지도안</h3>
                    <button class="print-btn" onclick="window.print()"><i class="fa-solid fa-print"></i> 인쇄</button>
                </div>
                <div class="gagne-steps">
                    ${gagneData.map(event => `
                        <div class="gagne-step-card">
                            <div class="step-sidebar">
                                <span class="step-num">${event.id.replace('Event', '')}</span>
                                <div class="step-line"></div>
                            </div>
                            <div class="step-content">
                                <div class="step-title-group">
                                    <h4>${event.label}</h4>
                                    <span class="process-badge">${event.process}</span>
                                </div>
                                <p class="step-base-desc">${event.description}</p>
                                <div class="step-ai-suggestion" id="ai-content-${event.id}">
                                    <div class="loading-shimmer">내용 생성 중...</div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    gridContainer.appendChild(section);

    // Event Bindings
    const btn = document.getElementById('generate-plan-btn');
    const selector = document.getElementById('std-selector');
    const display = document.getElementById('plan-display');

    btn.addEventListener('click', () => {
        const stdId = selector.value;
        if (!stdId) {
            alert('성취기준을 먼저 선택해주세요!');
            return;
        }

        display.classList.remove('hidden');
        generateAIInstructions(stdId);

        // Scroll to display
        display.scrollIntoView({ behavior: 'smooth' });
    });
}

function generateAIInstructions(stdId) {
    let standard;
    curriculumData.forEach(t => {
        const s = t.standards.find(std => std.id === stdId);
        if (s) standard = s;
    });

    gagneData.forEach((event, index) => {
        const container = document.getElementById(`ai-content-${event.id}`);

        // Simulating AI generation with a slight delay
        setTimeout(() => {
            const content = getInstructionSnippet(event.id, standard.content);
            container.innerHTML = `
                <div class="ai-box">
                    <i class="fa-solid fa-robot"></i>
                    <div class="ai-text">${content}</div>
                </div>
            `;
        }, 300 + (index * 150));
    });
}

function getInstructionSnippet(eventId, stdContent) {
    // This is a mock specialized generator based on Gagne's events
    const keywords = stdContent.split(' ').slice(0, 2).join(' ');

    const snippets = {
        "Event01": `[실험 영상 활용] '${keywords}'와(과) 관련된 신기한 자연 현상 또는 시사 뉴스 영상을 1분 내외로 시청하며 학습자의 호기심을 유발합니다.`,
        "Event02": `본 차시를 통해 학생들은 '${stdContent.substring(0, 30)}...' 능력을 기를 수 있음을 명확히 제시합니다.`,
        "Event03": `이전에 배운 관련 개념을 마인드맵으로 복습하며 '${keywords}'을(를) 배우기 위한 기반 지식을 점검합니다.`,
        "Event04": `시각 자료와 디지털 탐구 도구를 활용하여 '${keywords}'의 핵심 원리를 구조화하여 제시합니다.`,
        "Event05": `개념 간의 관계를 도표로 정리하여 제공하고, 어려운 용어는 비유를 들어 설명하여 이해를 돕습니다.`,
        "Event06": `활동지를 활용하여 배운 내용을 스스로 정리하거나, 소집단별로 '${keywords}' 관련 과제를 해결합니다.`,
        "Event07": `실시간 퀴즈 도구(예: Kahoot)를 활용하여 정답 여부를 즉시 확인하고 오개념을 교정해줍니다.`,
        "Event08": `형성평가를 통해 오늘 배운 핵심 성취기준 '${keywords}' 관련 목표 달성도를 개별적으로 체크합니다.`,
        "Event09": `오늘 배운 내용을 실생활 속 사례와 연결 지어 생각해보는 과제를 부여하여 학습의 전이를 돕습니다.`
    };

    return snippets[eventId] || "내용을 구성 중입니다.";
}

/**
 * Render Home View
 */
function renderHomeView() {
    gridContainer.innerHTML = `
        <div class="home-view">
            <section class="hero-section">
                <div class="hero-content">
                    <h1>2022 개정 과학과 교육과정<br><span>지능형 자원 대시보드</span></h1>
                    <p>중학교 과학 교육의 새로운 기준, 성취기준부터 교수·학습 및 평가까지<br>모든 자원을 한곳에서 스마트하게 탐색하세요.</p>
                    <div class="hero-stats">
                        <div class="stat-item">
                            <span class="stat-value">5</span>
                            <span class="stat-label">핵심 영역</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">18+</span>
                            <span class="stat-label">성취기준 주제</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">100%</span>
                            <span class="stat-label">디지털 최적화</span>
                        </div>
                    </div>
                </div>
                <div class="hero-image">
                    <i class="fa-solid fa-atom pulse-animation"></i>
                </div>
            </section>

            <div class="features-grid">
                <div class="feature-card" onclick="document.querySelector('[data-view=gane]').click()">
                    <div class="feature-icon"><i class="fa-solid fa-wand-magic-sparkles"></i></div>
                    <h3>만능 가네</h3>
                    <p>AI 수업 설계 도우미. 성취기준을 선택하면 가네의 9가지 수업 사태에 맞춘 맞춤형 수업 지도안을 생성합니다.</p>
                    <span class="feature-link">바로가기 <i class="fa-solid fa-arrow-right"></i></span>
                </div>
                <div class="feature-card" onclick="document.querySelector('[data-view=strategy]').click()">
                    <div class="feature-icon"><i class="fa-solid fa-graduation-cap"></i></div>
                    <h3>리비키 독서전략</h3>
                    <p>이병기 교수님의 독서전략. 과학과 교육과정 연계 독서 역량 강화를 위한 단계별 전략을 탐색합니다.</p>
                    <span class="feature-link">바로가기 <i class="fa-solid fa-arrow-right"></i></span>
                </div>
                <div class="feature-card" onclick="document.querySelector('[data-view=books]').click()">
                    <div class="feature-icon"><i class="fa-solid fa-book-bookmark"></i></div>
                    <h3>추천도서</h3>
                    <p>성취기준과 직접적으로 연계된 과학 전문 도서 및 심화 독서 자원을 확인하세요.</p>
                    <span class="feature-link">바로가기 <i class="fa-solid fa-arrow-right"></i></span>
                </div>
            </div>
        </div>
    `;
}

/**
 * Render Content System View
 */
function renderContentView(filterQuery = '') {
    const data = contentSystemData;
    const query = filterQuery.toLowerCase();
    gridContainer.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'content-system-view';

    // 1. Core Ideas Section
    const coreIdeasHtml = `
        <section class="topic-section">
            <div class="topic-header">
                <h2><i class="fa-solid fa-lightbulb"></i> 핵심 아이디어</h2>
            </div>
            <div class="core-ideas-grid">
                ${data.coreIdeas.map(idea => `
                    <div class="core-idea-card">
                        <p>· ${idea}</p>
                    </div>
                `).join('')}
            </div>
        </section>
    `;

    // 2. Knowledge Table Section
    const knowledgeHtml = `
        <section class="topic-section">
            <div class="topic-header">
                <h2><i class="fa-solid fa-book"></i> 지식 · 이해</h2>
            </div>
            <div class="knowledge-table-container">
                <table class="knowledge-table">
                    <thead>
                        <tr>
                            <th>범주</th>
                            <th>초등학교 3-4학년군</th>
                            <th>초등학교 5-6학년군</th>
                            <th>중학교 1-3학년</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.knowledge.map(k => `
                            <tr>
                                <td class="cat-cell">${k.category}</td>
                                <td>${k.grades.elementary34.map(item => `<span class="tag">${item}</span>`).join('')}</td>
                                <td>${k.grades.elementary56.map(item => `<span class="tag">${item}</span>`).join('')}</td>
                                <td>${k.grades.middle13.map(item => `<span class="tag">${item}</span>`).join('')}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </section>
    `;

    // 3. Skills & Values Section
    const skillsValuesHtml = `
        <div class="dual-column-grid">
            <section class="topic-section">
                <div class="topic-header">
                    <h2><i class="fa-solid fa-gears"></i> 과정 · 기능</h2>
                </div>
                <div class="info-group">
                    <ul class="check-list middle">
                        ${data.skills.middle.map(s => `<li>${s}</li>`).join('')}
                    </ul>
                </div>
            </section>
            <section class="topic-section">
                <div class="topic-header">
                    <h2><i class="fa-solid fa-heart"></i> 가치 · 태도</h2>
                </div>
                <div class="values-cloud">
                    ${data.values.map(v => `<span class="value-tag">${v}</span>`).join('')}
                </div>
            </section>
        </div>
    `;

    gridContainer.innerHTML = coreIdeasHtml + knowledgeHtml + skillsValuesHtml;
}

/**
 * Render the Grid of Topics and Standards
 * @param {string} filterQuery - optional search query
 */
function renderGrid(filterQuery = '') {
    const query = filterQuery.toLowerCase();
    gridContainer.innerHTML = '';

    curriculumData.forEach(topic => {
        // Filter standards
        const filteredStandards = topic.standards.filter(s =>
            s.content.toLowerCase().includes(query) ||
            s.code.toLowerCase().includes(query)
        );

        const titleMatch = topic.title.toLowerCase().includes(query);

        if (query && !titleMatch && filteredStandards.length === 0) return;

        // Create Topic Section
        const section = document.createElement('section');
        section.className = 'topic-section';
        section.id = topic.id;

        section.innerHTML = `
            <div class="topic-header">
                <h2>${topic.title}</h2>
            </div>
            <div class="standards-grid">
                ${filteredStandards.map(std => createStandardCard(topic, std)).join('')}
            </div>
        `;

        gridContainer.appendChild(section);
    });

    if (gridContainer.innerHTML === '') {
        renderEmptyState(filterQuery);
    }
}

/**
 * Render Info View (Teaching/Learning or Evaluation)
 */
function renderInfoView(dataKey, filterQuery = '') {
    const data = evaluationData[dataKey];
    const query = filterQuery.toLowerCase();
    gridContainer.innerHTML = '';

    const section = document.createElement('section');
    section.className = 'topic-section';

    let sectionsHtml = data.sections.map(sec => {
        const filteredItems = sec.items.filter(item =>
            item.content.toLowerCase().includes(query) ||
            item.label.toLowerCase().includes(query)
        );

        if (query && filteredItems.length === 0 && !sec.title.toLowerCase().includes(query)) return '';

        return `
            <div class="info-group">
                <h3>${sec.title}</h3>
                <div class="info-items">
                    ${filteredItems.map(item => `
                        <div class="info-card">
                            <span class="info-label">${item.label}</span>
                            <p class="info-content">${item.content}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');

    if (!sectionsHtml && filterQuery) {
        renderEmptyState(filterQuery);
        return;
    }

    section.innerHTML = `
        <div class="topic-header">
            <h2><i class="fa-solid ${data.icon}"></i> ${data.title}</h2>
        </div>
        <div class="info-content-wrapper">
            ${sectionsHtml}
        </div>
    `;
    gridContainer.appendChild(section);
}

function renderEmptyState(query) {
    gridContainer.innerHTML = `
        <div style="text-align: center; padding: 5rem; color: var(--text-muted);">
            <i class="fa-solid fa-search fa-3x" style="margin-bottom: 1rem; opacity: 0.3;"></i>
            <p>"${query}"에 대한 검색 결과가 없습니다.</p>
        </div>
    `;
}

/**
 * Create a Standard Card HTML
 */
function createStandardCard(topic, std) {
    return `
        <article class="standard-card">
            <div class="card-tag">${std.code}</div>
            <div class="card-content">${std.content}</div>
            <div class="card-actions">
                <button onclick="openDetail('${topic.id}', '${std.id}', 'explanation')">
                    <i class="fa-solid fa-book-open"></i> 해설
                </button>
                <button onclick="openDetail('${topic.id}', '${std.id}', 'activities')">
                    <i class="fa-solid fa-flask"></i> 탐구활동
                </button>
                <button onclick="openDetail('${topic.id}', '${std.id}', 'considerations')">
                    <i class="fa-solid fa-circle-info"></i> 고려사항
                </button>
            </div>
        </article>
    `;
}

/**
 * Modal logic
 */
window.openDetail = (topicId, stdId, type) => {
    const topic = curriculumData.find(t => t.id === topicId);
    const standard = topic.standards.find(s => s.id === stdId);

    let content = '';
    let title = '';
    let icon = '';

    switch (type) {
        case 'explanation':
            title = '성취기준 해설';
            icon = 'fa-book-open';
            content = standard.explanation || '등록된 해설 내용이 없습니다.';
            content = `<div class="detail-text">${content}</div>`;
            break;
        case 'activities':
            title = '탐구 활동';
            icon = 'fa-flask';
            content = `<ul class="modal-list">${topic.activities.map(a => `<li>${a}</li>`).join('')}</ul>`;
            break;
        case 'considerations':
            title = '성취기준 적용 시 고려 사항';
            icon = 'fa-circle-info';
            content = `<ul class="modal-list">${topic.considerations.map(c => `<li>${c}</li>`).join('')}</ul>`;
            break;
    }

    modalTitle.innerText = title;
    modalIcon.className = `fa-solid ${icon}`;
    modalBody.innerHTML = content;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
};

window.closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
};

// Close modal on outside click
modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

// Search Handler
searchInput.addEventListener('input', (e) => {
    renderView(e.target.value);
});

// Initialize on load
document.addEventListener('DOMContentLoaded', initDashboard);
