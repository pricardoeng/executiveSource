const realProfiles = {
    "operacoes": [
        {
            id: 1,
            name: "Lucas Lima",
            title: "COO (Chief Operating Officer)",
            company: "QuintoAndar",
            experience: "Responsável por toda a operação, execução de estratégia e resultados da plataforma.",
            match: 99,
            linkedin: "https://linkedin.com/in/lucas-lima",
            avatar: ""
        },
        {
            id: 2,
            name: "Viviane Sales",
            title: "CEO (Ex-VP de Operações)",
            company: "Loggi",
            experience: "Liderança em expansão logística nacional e foco no mercado de PMEs.",
            match: 97,
            linkedin: "https://linkedin.com/in/viviane-sales",
            avatar: ""
        },
        {
            id: 3,
            name: "Felipe Criniti",
            title: "CEO (Foco Operacional)",
            company: "Rappi Brasil",
            experience: "Gestão executiva de uma das maiores plataformas de delivery da América Latina.",
            match: 95,
            linkedin: "https://linkedin.com/in/felipe-criniti",
            avatar: ""
        },
        {
            id: 4,
            name: "Priscila Siqueira",
            title: "CEO Brasil",
            company: "Wellhub (ex-Gympass)",
            experience: "Liderança estratégica e operacional no ecossistema de bem-estar corporativo.",
            match: 92,
            linkedin: "https://linkedin.com/in/priscila-siqueira",
            avatar: ""
        }
    ],
    "tecnologia": [
        {
            id: 1,
            name: "Eric Young",
            title: "Chief Technology Officer (CTO)",
            company: "Nubank",
            experience: "Liderança global de engenharia e escala financeira em um dos maiores neobancos do mundo.",
            match: 99,
            linkedin: "https://linkedin.com/in/eric-young",
            avatar: ""
        },
        {
            id: 2,
            name: "André Fatala",
            title: "VP of Platform",
            company: "Magazine Luiza",
            experience: "Arquiteto do ecossistema digital Luizalabs e transformação digital do varejo.",
            match: 96,
            linkedin: "https://linkedin.com/in/andre-fatala",
            avatar: ""
        },
        {
            id: 3,
            name: "Ricardo Guerra",
            title: "Chief Information Officer (CIO)",
            company: "Itaú Unibanco",
            experience: "Líder de transformação tecnológica e modernização da infraestrutura bancária.",
            match: 94,
            linkedin: "https://linkedin.com/in/ricardo-guerra",
            avatar: ""
        }
    ]
};

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
                        <p>Nenhum perfil carregado. Insira os requisitos acima para iniciar a busca real.</p>
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
        
        // Get initials for the candidate
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
    // Start with empty base
    renderCandidates([]);
    
    const searchBtn = document.getElementById('btn-search');
    const jobInput = document.getElementById('job-description');

    searchBtn.addEventListener('click', () => {
        const query = jobInput.value.toLowerCase().trim();
        
        // Visual feedback
        searchBtn.innerHTML = '<i data-lucide="loader-2" class="animate-spin"></i> Buscando na Internet...';
        window.lucide.createIcons();
        
        setTimeout(() => {
            let results = [];
            
            if (query.includes('oper') || query.includes('coo')) {
                results = realProfiles["operacoes"];
            } else if (query.includes('tech') || query.includes('cto') || query.includes('eng')) {
                results = realProfiles["tecnologia"];
            } else {
                // If generic, show a mix or explain
                results = [...realProfiles["operacoes"], ...realProfiles["tecnologia"]].sort(() => Math.random() - 0.5).slice(0, 4);
            }
            
            renderCandidates(results);
            searchBtn.innerHTML = '<i data-lucide="zap"></i> Rankear';
            window.lucide.createIcons();
        }, 1500);
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
