// Vercel Serverless Function (CommonJS: package.json 없이 모든 Node 런타임 호환)
function pickCommonChatFields(payload) {
    const out = {
        messages: payload.messages
    };
    const passthroughKeys = ['temperature', 'top_p', 'stop', 'presence_penalty', 'frequency_penalty', 'seed'];
    for (const key of passthroughKeys) {
        if (payload[key] !== undefined) {
            out[key] = payload[key];
        }
    }
    return out;
}

function hasNonEmptyChoiceContent(data) {
    const content = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    return typeof content === 'string' && content.trim().length > 0;
}

async function callUpstream(url, apiKey, bodyPayload, timeoutMs = 38000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(new Error('Upstream timeout')), timeoutMs);

    try {
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            signal: controller.signal,
            body: JSON.stringify(bodyPayload)
        });
        const data = await res.json().catch(() => ({}));
        return { ok: res.ok, status: res.status, data };
    } finally {
        clearTimeout(timer);
    }
}

module.exports = async function handler(request, response) {
    // 웹/웹뷰(file://, capacitor://, localhost, *.vercel.app, 커스텀 도메인) 공통 CORS 허용
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
    response.setHeader('Access-Control-Max-Age', '86400');

    if (request.method === 'OPTIONS') {
        return response.status(204).end();
    }

    const exaoneKey = (process.env.EXAONE_API_KEY || process.env.LG_EXAONE_API_KEY || '').trim();
    const nvidiaKey = (process.env.NVIDIA_NIM_API_KEY || '').trim();

    // 상태 확인용 GET (/api/groq 접속 시 환경 변수 인식 여부만 true/false로 확인)
    if (request.method === 'GET') {
        return response.status(200).json({
            ok: Boolean(exaoneKey || nvidiaKey),
            providers: {
                exaone: Boolean(exaoneKey),
                nvidia: Boolean(nvidiaKey)
            }
        });
    }

    if (request.method !== 'POST') {
        return response.status(405).json({ error: "Method Not Allowed" });
    }

    if (!exaoneKey && !nvidiaKey) {
        console.error("❌ 서버 환경 변수에 EXAONE_API_KEY / NVIDIA_NIM_API_KEY가 모두 설정되어 있지 않습니다.");
        return response.status(500).json({
            error: "API 키 설정 누락 (Vercel Environment Variables에 EXAONE_API_KEY 또는 NVIDIA_NIM_API_KEY 등록 후 Redeploy 필요)"
        });
    }

    try {
        let payload = request.body;
        if (typeof payload === 'string') {
            payload = JSON.parse(payload);
        }
        if (!payload || !Array.isArray(payload.messages)) {
            return response.status(400).json({ error: "잘못된 요청 형식 (messages 필요)" });
        }

        const baseFields = pickCommonChatFields(payload);

        // 우선순위: EXAONE(등록된 경우, 최대 38초) -> NVIDIA NIM(폴백, 최대 18초)
        const targets = [];
        if (exaoneKey) {
            targets.push({
                name: 'exaone',
                url: 'https://api.exaone.ai/v1/chat/completions',
                apiKey: exaoneKey,
                timeoutMs: 38000,
                body: {
                    ...baseFields,
                    model: payload.exaoneModel || 'k-exaone_v2.5',
                    reasoning_effort: payload.reasoning_effort || 'low',
                    max_tokens: Math.max(Number(payload.max_tokens) || 3000, 3000)
                }
            });
        }
        if (nvidiaKey) {
            const nvidiaBody = {
                ...baseFields,
                model: payload.nvidiaModel || payload.model || 'google/gemma-4-31b-it'
            };
            if (payload.max_tokens !== undefined) {
                nvidiaBody.max_tokens = Number(payload.max_tokens) || 900;
            }
            targets.push({
                name: 'nvidia',
                url: 'https://integrate.api.nvidia.com/v1/chat/completions',
                apiKey: nvidiaKey,
                timeoutMs: 18000,
                body: nvidiaBody
            });
        }

        let lastError = null;
        for (const target of targets) {
            try {
                const result = await callUpstream(target.url, target.apiKey, target.body, target.timeoutMs);
                if (result.ok && hasNonEmptyChoiceContent(result.data)) {
                    return response.status(200).json(result.data);
                }
                if (result.ok) {
                    console.warn(`[${target.name}] Empty completion content`);
                    lastError = { status: 502, data: { error: `${target.name} returned empty content` }, provider: target.name };
                    continue;
                }
                console.error(`[${target.name}] API Error:`, result.status, result.data);
                lastError = { status: result.status, data: result.data, provider: target.name };
            } catch (err) {
                console.error(`[${target.name}] Fetch Failed:`, err.message);
                lastError = { status: 502, data: { error: err.message }, provider: target.name };
            }
        }

        return response.status((lastError && lastError.status) || 502).json(
            (lastError && lastError.data) || { error: "모든 AI API 호출 실패" }
        );
    } catch (error) {
        return response.status(500).json({ error: "Proxy 서버 내부 오류", details: error.message });
    }
};
