function renderCandidates(data) {
    const tableBody = document.getElementById('candidates-body');
    
    // Update Stats
    document.getElementById('stat-candidatos').textContent = data.length;
    if (data.length > 0) {
        const avgMatch = Math.round(data.reduce((acc, curr) => acc + curr.match, 0) / data.length);
        document.getElementById('stat-match').textContent = `${avgMatch}%`;
        document.getElementById('stat-vagas').textContent = "1";
    } else {
        document.getElementById('stat-match').textContent = `0%`;
        document.getElementById('stat-vagas').textContent = "0";
    }

    if (data.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 4rem; color: var(--grey-500);">
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 1rem;">
                        <i data-lucide="search-x" style="width: 48px; height: 48px; opacity: 0.3;"></i>
                        <p>Nenhum perfil carregado. Insira os requisitos acima para iniciar a busca em tempo real.</p>
                    </div>
                </td>
            </tr>
        `;
        if (window.lucide) window.lucide.createIcons();
        return;
    }

    tableBody.innerHTML = '';

    data.forEach((candidate, index) => {
        const row = document.createElement('tr');
        row.className = 'animate-fade-in';
        row.style.animationDelay = `${(index + 1) * 0.1}s`;

        const rankClass = index === 0 ? 'rank-1' : index === 1 ? 'rank-2' : index === 2 ? 'rank-3' : '';
        
        const initials = candidate.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        
        row.innerHTML = `
            <td>
                <div class="rank-pill ${rankClass}">
                    ${index + 1}
                </div>
            </td>
            <td>
                <div class="candidate-info">
                    <div class="avatar-initials" style="width: 32px; height: 32px; font-size: 0.7rem; margin-right: 12px;">
                        ${initials}
                    </div>
                    <div>
                        <span class="candidate-name">${candidate.name}</span>
                        <span class="candidate-title">${candidate.title}</span>
                    </div>
                </div>
            </td>
            <td>${candidate.company}</td>
            <td>
                <span class="badge badge-match">${candidate.match}% Match</span>
            </td>
            <td style="font-size: 0.85rem; color: var(--grey-600);">${candidate.experience}</td>
            <td>
                <a href="${candidate.linkedin}" target="_blank" class="linkedin-link">
                    <i data-lucide="linkedin" style="width: 16px;"></i>
                    Perfil
                </a>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    renderCandidates([]);
    
    const searchBtn = document.getElementById('btn-search');
    const jobInput = document.getElementById('job-description');

    searchBtn.addEventListener('click', async () => {
        const query = jobInput.value.trim();
        if (!query) return;
        
        // Visual feedback
        searchBtn.disabled = true;
        searchBtn.innerHTML = '<i data-lucide="loader-2" class="animate-spin"></i> Buscando na Internet...';
        window.lucide.createIcons();
        
        try {
            // Chamada para a nossa API Serverless na Vercel
            const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            const results = await response.json();
            
            if (results.error) {
                alert("Erro na busca: " + results.error);
                renderCandidates([]);
            } else {
                renderCandidates(results);
            }
        } catch (error) {
            console.error("Search failed:", error);
            alert("Falha ao conectar com o serviço de busca.");
            renderCandidates([]);
        } finally {
            searchBtn.disabled = false;
            searchBtn.innerHTML = '<i data-lucide="zap"></i> Rankear';
            window.lucide.createIcons();
        }
    });
});

// Animation style
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    .animate-spin {
        animation: spin 1s linear infinite;
    }
`;
document.head.appendChild(style);
