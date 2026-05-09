// State Management
let appState = {
    vagas: JSON.parse(localStorage.getItem('forgood_vagas')) || [],
    bancoDeTalentos: JSON.parse(localStorage.getItem('forgood_banco')) || [],
    activeVagaId: localStorage.getItem('forgood_activeVagaId') || null,
    currentSearchResults: []
};

function clearAllData() {
    if (confirm("Isso apagará permanentemente todas as vagas e o banco de talentos. Confirmar?")) {
        localStorage.clear();
        appState = { vagas: [], bancoDeTalentos: [], activeVagaId: null, currentSearchResults: [] };
        saveState();
        location.reload();
    }
}

function saveState() {
    localStorage.setItem('forgood_vagas', JSON.stringify(appState.vagas));
    localStorage.setItem('forgood_banco', JSON.stringify(appState.bancoDeTalentos));
    localStorage.setItem('forgood_activeVagaId', appState.activeVagaId);
}

// Navigation
function showSection(sectionId) {
    const sections = ['dashboard', 'vagas', 'busca', 'banco'];
    sections.forEach(s => {
        const el = document.getElementById(`section-${s}`);
        if (el) el.style.display = s === sectionId ? 'block' : 'none';
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('onclick')?.includes(sectionId)) {
            link.classList.add('active');
        }
    });

    if (sectionId === 'vagas') renderVagasList();
    if (sectionId === 'dashboard') updateDashboardStats();
    if (sectionId === 'banco') renderBancoTalentos();
}

function quickSearchForActiveVaga() {
    const activeVaga = appState.vagas.find(v => v.id === appState.activeVagaId);
    if (!activeVaga) return;
    showSection('busca');
    document.getElementById('job-description').value = activeVaga.name;
    document.getElementById('btn-search').click();
}

// Vacancy Management
function createNewVaga() {
    const name = prompt("Nome da Vaga (ex: Head de Operações):");
    if (!name) return;
    const newVaga = { id: Date.now().toString(), name: name, status: 'Aberta', createdAt: new Date().toLocaleDateString(), candidates: [] };
    appState.vagas.push(newVaga);
    appState.activeVagaId = newVaga.id;
    saveState();
    renderVagasList();
    updateDashboardStats();
}

function selectVaga(id) {
    appState.activeVagaId = id;
    saveState();
    showSection('dashboard');
}

function renderVagasList() {
    const container = document.getElementById('vagas-list-grid');
    if (!container) return;
    container.innerHTML = '';
    appState.vagas.forEach(vaga => {
        const card = document.createElement('div');
        card.className = `stat-card animate-fade-in ${appState.activeVagaId === vaga.id ? 'active-vaga-card' : ''}`;
        card.onclick = () => selectVaga(vaga.id);
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                <div class="stat-icon"><i data-lucide="briefcase"></i></div>
                <span class="badge ${vaga.status === 'Aberta' ? 'badge-match' : 'badge-closed'}">${vaga.status}</span>
            </div>
            <div class="stat-value" style="font-size: 1.2rem;">${vaga.name}</div>
            <div class="stat-label">${vaga.candidates.length} Candidatos Salvos</div>
            <p style="font-size: 0.7rem; color: var(--grey-500); margin-top: 1rem;">Criada em: ${vaga.createdAt}</p>
        `;
        container.appendChild(card);
    });
    if (window.lucide) window.lucide.createIcons();
}

// Helper for Avatar
function getAvatarHTML(candidate) {
    if (candidate.photo) {
        return `<div class="avatar-circle"><img src="${candidate.photo}" alt="${candidate.name}" style="width:100%; height:100%; object-fit:cover;"></div>`;
    }
    const initials = candidate.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    return `<div class="avatar-circle">${initials}</div>`;
}

// NEW LINKEDIN ICON SVG (Square blue as requested)
const linkedinIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>`;

// Dashboard Stats & Saved Table
function updateDashboardStats() {
    const activeVaga = appState.vagas.find(v => v.id === appState.activeVagaId);
    const totalCandidatosGlobal = appState.bancoDeTalentos.length;
    
    document.getElementById('stat-vagas').textContent = appState.vagas.filter(v => v.status === 'Aberta').length;
    document.getElementById('stat-candidatos').textContent = totalCandidatosGlobal;
    
    const banner = document.getElementById('vaga-context-banner');
    const savedSection = document.getElementById('saved-candidates-section');
    const tableBody = document.getElementById('saved-candidates-body');

    if (activeVaga) {
        banner.style.display = 'flex';
        document.getElementById('active-vaga-name').textContent = activeVaga.name;
        
        if (activeVaga.candidates && activeVaga.candidates.length > 0) {
            savedSection.style.display = 'block';
            tableBody.innerHTML = '';
            activeVaga.candidates.forEach((candidate, idx) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td style="width: 50px; font-weight: 700; color: var(--grey-400);">${idx + 1}º</td>
                    <td>
                        <div class="candidate-info">
                            ${getAvatarHTML(candidate)}
                            <div>
                                <span class="candidate-name">${candidate.name}</span>
                                <span class="candidate-title">${candidate.title}</span>
                            </div>
                        </div>
                    </td>
                    <td><span style="font-weight: 600; color: var(--grey-600);">${candidate.company}</span></td>
                    <td><span class="badge badge-match">${candidate.match}%</span></td>
                    <td>
                        <div class="action-buttons-group" style="justify-content: flex-end;">
                            <a href="${candidate.linkedin}" target="_blank" class="btn-icon-action btn-linkedin" title="LinkedIn">
                                ${linkedinIconSVG}
                            </a>
                            <button onclick="connectToCandidate('${candidate.name.replace(/'/g, "\\'")}', '${candidate.linkedin}')" class="btn-icon-action btn-connect-icon" title="Enviar Convite">
                                <i data-lucide="send"></i>
                            </button>
                            <button class="btn-icon-action" style="background: rgba(255, 77, 77, 0.1); color: #ff4d4d; border-color: rgba(255, 77, 77, 0.1);" onclick="removeCandidate('${activeVaga.id}', '${candidate.linkedin}')" title="Remover">
                                <i data-lucide="trash-2"></i>
                            </button>
                        </div>
                    </td>
                `;
                tableBody.appendChild(row);
            });
            const avgMatch = Math.round(activeVaga.candidates.reduce((acc, curr) => acc + curr.match, 0) / activeVaga.candidates.length);
            document.getElementById('stat-match').textContent = `${avgMatch}%`;
        } else {
            savedSection.style.display = 'none';
            document.getElementById('stat-match').textContent = '0%';
        }
    } else {
        banner.style.display = 'none';
        savedSection.style.display = 'none';
        document.getElementById('stat-match').textContent = '0%';
    }
    if (window.lucide) window.lucide.createIcons();
}

// Banco de Talentos
function renderBancoTalentos() {
    const container = document.getElementById('banco-talentos-body');
    if (!container) return;
    if (appState.bancoDeTalentos.length === 0) {
        container.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 4rem; color: var(--grey-500);">Banco vazio.</td></tr>';
        return;
    }
    container.innerHTML = '';
    appState.bancoDeTalentos.forEach((candidate, idx) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="width: 50px; font-weight: 700; color: var(--grey-400);">${idx + 1}º</td>
            <td>
                <div class="candidate-info">
                    ${getAvatarHTML(candidate)}
                    <div>
                        <span class="candidate-name">${candidate.name}</span>
                        <span class="candidate-title">${candidate.title}</span>
                    </div>
                </div>
            </td>
            <td><strong style="color: var(--grey-600);">${candidate.company}</strong></td>
            <td><span class="badge badge-match">${candidate.match}%</span></td>
            <td>
                <div class="action-buttons-group" style="justify-content: flex-end;">
                    <a href="${candidate.linkedin}" target="_blank" class="btn-icon-action btn-linkedin">${linkedinIconSVG}</a>
                    <button onclick="connectToCandidate('${candidate.name.replace(/'/g, "\\'")}', '${candidate.linkedin}')" class="btn-icon-action btn-connect-icon"><i data-lucide="send"></i></button>
                    <button class="btn-icon-action" style="background: rgba(255, 77, 77, 0.1); color: #ff4d4d; border-color: transparent;" onclick="removeFromBank('${candidate.linkedin}')"><i data-lucide="trash-2"></i></button>
                </div>
            </td>
        `;
        container.appendChild(row);
    });
    if (window.lucide) window.lucide.createIcons();
}

function removeFromBank(linkedinUrl) {
    if (!confirm("Remover do banco?")) return;
    appState.bancoDeTalentos = appState.bancoDeTalentos.filter(c => c.linkedin !== linkedinUrl);
    saveState();
    renderBancoTalentos();
    updateDashboardStats();
}

function removeCandidate(vagaId, linkedinUrl) {
    if (!confirm("Remover da vaga?")) return;
    const vaga = appState.vagas.find(v => v.id === vagaId);
    vaga.candidates = vaga.candidates.filter(c => c.linkedin !== linkedinUrl);
    saveState();
    updateDashboardStats();
}

// Search & Save
async function performSearch() {
    const query = document.getElementById('job-description').value.trim();
    if (!query) return;
    
    const searchBtn = document.getElementById('btn-search');
    searchBtn.disabled = true;
    searchBtn.innerHTML = '<i data-lucide="loader-2" class="animate-spin"></i> Buscando...';
    if (window.lucide) window.lucide.createIcons();

    try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const results = await response.json();
        renderCandidates(results);
    } catch (error) {
        console.error(error);
    } finally {
        searchBtn.disabled = false;
        searchBtn.innerHTML = '<i data-lucide="zap"></i> Rankear';
        if (window.lucide) window.lucide.createIcons();
    }
}

function renderCandidates(data) {
    appState.currentSearchResults = data;
    const tableBody = document.getElementById('candidates-body');
    if (!tableBody) return;
    if (data.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 4rem; color: var(--grey-500);">Nenhum resultado.</td></tr>`;
        return;
    }
    tableBody.innerHTML = '';
    data.forEach((candidate, index) => {
        const isSaved = appState.bancoDeTalentos.some(c => c.linkedin === candidate.linkedin);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="width: 50px; font-weight: 800; color: ${index < 3 ? 'var(--primary)' : 'var(--grey-400)'};">${index + 1}º</td>
            <td>
                <div class="candidate-info">
                    ${getAvatarHTML(candidate)}
                    <div>
                        <span class="candidate-name">${candidate.name}</span>
                        <span class="candidate-title">${candidate.title}</span>
                        <span style="font-size: 0.65rem; color: var(--grey-400);"><i data-lucide="map-pin" style="width:10px; height:10px;"></i> ${candidate.location}</span>
                    </div>
                </div>
            </td>
            <td><div style="font-weight: 600; color: var(--grey-600);">${candidate.company}</div></td>
            <td style="width: 100px;"><span class="badge badge-match">${candidate.match}%</span></td>
            <td style="font-size: 0.75rem; color: var(--grey-500); line-height: 1.4; max-width: 350px;">${candidate.experience}</td>
            <td style="width: 150px;">
                <div class="action-buttons-group">
                    <button class="btn-icon-action btn-save" title="Salvar" onclick="saveCandidate(${index})" style="background: ${isSaved ? '#4CAF50' : 'var(--darker)'}">
                        <i data-lucide="${isSaved ? 'check' : 'bookmark'}"></i>
                    </button>
                    <a href="${candidate.linkedin}" target="_blank" class="btn-icon-action btn-linkedin" title="LinkedIn">${linkedinIconSVG}</a>
                    <button onclick="connectToCandidate('${candidate.name.replace(/'/g, "\\'")}', '${candidate.linkedin}')" class="btn-icon-action btn-connect-icon" title="Conectar"><i data-lucide="send"></i></button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
    if (window.lucide) window.lucide.createIcons();
}

function saveCandidate(index) {
    const candidate = appState.currentSearchResults[index];
    if (!appState.bancoDeTalentos.some(c => c.linkedin === candidate.linkedin)) {
        appState.bancoDeTalentos.push(candidate);
    }
    if (appState.activeVagaId) {
        const vaga = appState.vagas.find(v => v.id === appState.activeVagaId);
        if (!vaga.candidates.some(c => c.linkedin === candidate.linkedin)) {
            vaga.candidates.push(candidate);
        }
    }
    saveState();
    updateDashboardStats();
    renderCandidates(appState.currentSearchResults);
}

function connectToCandidate(name, linkedinUrl) {
    const activeVaga = appState.vagas.find(v => v.id === appState.activeVagaId);
    const vagaName = activeVaga ? activeVaga.name : "uma oportunidade estratégica";
    const message = `Olá ${name.split(' ')[0]}, vi seu perfil e ele é ideal para a vaga de ${vagaName}. Topa conversar?`;
    navigator.clipboard.writeText(message).then(() => {
        alert("Convite copiado! Cole ao conectar no LinkedIn.");
        window.open(linkedinUrl, '_blank');
    });
}

document.addEventListener('DOMContentLoaded', () => {
    showSection('dashboard');
    const searchBtn = document.getElementById('btn-search');
    if (searchBtn) searchBtn.addEventListener('click', performSearch);
});

function exportVagaData() {
    const activeVaga = appState.vagas.find(v => v.id === appState.activeVagaId);
    if (!activeVaga) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activeVaga, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `vaga_${activeVaga.name.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function exportAllTalents() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appState.bancoDeTalentos, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `banco_talentos.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}
