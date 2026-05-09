export default async function handler(req, res) {
    const { q } = req.query;
    const apiKey = "ff3138f9e9a709c5dc919294741c8e20020886fd23273aa1570d6698925b6569";
    
    if (!q) {
        return res.status(400).json({ error: "Query is required" });
    }

    try {
        // Busca estruturada no LinkedIn via SerpApi
        const searchQuery = `site:linkedin.com/in/ "${q}" Brazil`;
        const url = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(searchQuery)}&api_key=${apiKey}&num=10`;

        const response = await fetch(url);
        const data = await response.json();

        if (!data.organic_results) {
            return res.status(200).json([]);
        }

        // Mapeia os resultados orgânicos para o formato do nosso sistema
        const profiles = data.organic_results.map((result, index) => {
            const parts = result.title.replace(" | LinkedIn", "").split(" - ");
            const name = parts[0] || "Executivo";
            const title = parts[1] || q;
            const company = parts[2] || "N/A";

            const snippet = result.snippet || "";
            let location = "Brasil";
            if (snippet.includes(" · ")) {
                location = snippet.split(" · ")[0];
            }

            return {
                id: index + 1,
                name: name.trim(),
                title: title.trim(),
                company: company.trim(),
                location: location,
                experience: snippet,
                match: Math.floor(Math.random() * (99 - 88 + 1) + 88),
                linkedin: result.link,
                photo: result.thumbnail || ""
            };
        });

        res.status(200).json(profiles);
    } catch (error) {
        console.error("Search error:", error);
        res.status(500).json({ error: "Failed to fetch data" });
    }
}
