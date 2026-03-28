export default async function handler(request, response) {
    // CORS 헤더 설정 (GitHub Pages 등 다른 도메인에서 호출할 수 있도록 허용)
    response.setHeader('Access-Control-Allow-Credentials', true);
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    response.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (request.method === 'OPTIONS') {
        return response.status(200).end();
    }

    // Vercel 설정에서 등록할 환경 변수
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        console.error("GROQ_API_KEY is missing in environment variables!");
        return response.status(500).json({ error: "서버 설정 오류: API 키가 없습니다." });
    }

    try {
        const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(request.body)
        });

        const data = await groqResponse.json();
        return response.status(groqResponse.status).json(data);
    } catch (error) {
        console.error("Vercel Proxy Error:", error);
        return response.status(500).json({ 
            error: "AI 요청 전달 실패", 
            details: error.message 
        });
    }
}