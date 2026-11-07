const fs = require('fs');
const readline = require('readline');

function parseCSVLine(text) {
    const result = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === '"') {
            if (inQuotes && text[i + 1] === '"') {
                cur += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(cur);
            cur = '';
        } else {
            cur += char;
        }
    }
    result.push(cur);
    return result;
}

function norm(str) {
    return (str || '').toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '');
}

async function main() {
    // 1. CSV 로드
    console.log('Loading CSV...');
    const csvStream = fs.createReadStream('players.csv', { encoding: 'utf-8' });
    const rl = readline.createInterface({ input: csvStream, crlfDelay: Infinity });

    const csvById = new Map();
    const csvPlayers = [];

    for await (const line of rl) {
        if (!line.trim()) continue;
        const cols = parseCSVLine(line);
        if (cols[0] === 'player_id') continue;
        const pid = cols[0];
        const mainPos = cols[5] || '';
        const rawSec = cols[6] || '';
        const otherPositions = rawSec.trim() ? rawSec.trim().split(/\s+/).filter(Boolean) : [];
        const item = {
            id: pid,
            knownAs: cols[1],
            firstName: cols[2],
            lastName: cols[3],
            ovr: parseInt(cols[4], 10),
            mainPos,
            otherPositions,
            club: cols[7],
            league: cols[8],
            nation: cols[9],
            normKnown: norm(cols[1]),
            normFull: norm(`${cols[2]} ${cols[3]}`),
            normLast: norm(cols[3])
        };
        csvById.set(pid, item);
        csvPlayers.push(item);
    }
    console.log(`Loaded ${csvById.size} players from CSV`);

    // 2. ID 없는 유명 선수 매핑 사전
    const nameMap = {
        '리오넬 메시': 'Lionel Messi',
        '루이스 수아레스': 'Luis Suárez',
        '세르히오 부스케츠': 'Sergio Busquets',
        '조르디 알바': 'Jordi Alba',
        '로드리고 데 파울': 'Rodrigo De Paul',
        '드레이크 캘린더': 'Drake Callender',
        '벤자민 크레마스키': 'Benjamin Cremaschi',
        '니콜라스 프레이레': 'Nicolás Freire',
        '로만 첼렌타노': 'Roman Celentano',
        '마르텐 파에스': 'Maarten Paes',
        '워커 짐머만': 'Walker Zimmerman',
        '맷 미아즈가': 'Matt Miazga',
        '마일스 로빈슨': 'Miles Robinson',
        '카이 바그너': 'Kai Wagner',
        '라이언 홀링스헤드': 'Ryan Hollingshead',
        '루시아노 아코스타': 'Luciano Acosta',
        '카를레스 길': 'Carles Gil',
        '하니 무크타르': 'Hany Mukhtar',
        '리키 푸치': 'Riqui Puig',
        '티아고 알마다': 'Thiago Almada',
        '쿠초 에르난데스': 'Cucho Hernández',
        '드니 부앙가': 'Denis Bouanga',
        '크리스티안 벤테케': 'Christian Benteke',
        '로렌초 인시녜': 'Lorenzo Insigne',
        '요르고스 야쿠마키스': 'Giorgos Giakoumakis',
        '크리스티아누 호날두': 'Cristiano Ronaldo',
        '사디오 마네': 'Sadio Mané',
        '마르첼로 브로조비치': 'Marcelo Brozović',
        '나와프 알 아키디': 'Nawaf Al Aqidi',
        '술탄 알 간남': 'Sultan Al Ghannam',
        '압둘레라 알 암리': 'Abdulelah Al Amri',
        '사미 알 나지': 'Sami Al Najai',
        '모하마드 마란': 'Mohammed Marran',
        '알리 알 하산': 'Ali Al Hassan',
        '아이만 야히야': 'Ayman Yahya',
        '압둘라흐만 가리브': 'Abdulrahman Ghareeb',
        '나와프 부샬': 'Nawaf Boushal',
        '벤투': 'Bento',
        '라그드 알 나자르': 'Raghid Al Najjar',
        '모하메드 시마칸': 'Mohamed Simakan',
        '나데르 알 샤라리': 'Nader Al Sharari',
        '이니고 마르티네스': 'Iñigo Martínez',
        '압둘라 알 카이바리': 'Abdullah Al Khaibari',
        '압둘말릭 알 자베르': 'Abdulmalik Al Jaber',
        '앙젤루 가브리에우': 'Ângelo',
        '킹슬리 코망': 'Kingsley Coman',
        '하룬 카마라': 'Haroune Camara',
        '주앙 펠릭스': 'João Félix',
        '웨슬리 가소바': 'Wesley',
        '압둘라흐만 수퍄니': 'Abdulrahman Sufyani',
        '사아드 알 나세르': 'Saad Al Nasser',
        '야신 부누': 'Yassine Bounou',
        '칼리두 쿨리발리': 'Kalidou Koulibaly',
        '테오 에르난데스': 'Theo Hernández',
        '하산 알 탐박티': 'Hassan Tambakti',
        '하마드 알 야미': 'Hamad Al Yami',
        '알리 라자미': 'Ali Lajami',
        '후벵 네베스': 'Rúben Neves',
        '세르게이 밀린코비치-사비치': 'Sergej Milinković-Savić',
        '모하메드 칸노': 'Mohamed Kanno',
        '살렘 알 다우사리': 'Salem Al Dawsari',
        '나세르 알 다우사리': 'Nasser Al Dawsari',
        '마우콩': 'Malcom',
        '마르코스 레오나르두': 'Marcos Leonardo',
        '모테브 알 하르비': 'Moteb Al Harbi',
        '다르윈 누녜스': 'Darwin Núñez',
        '모하메드 알 야미': 'Mohammed Al Yami',
        '마티외 파투예': 'Mathieu Patouillet',
        '아흐마드 아부 라센': 'Ahmad Abu Rasen',
        '라얀 알 도사리': 'Rayan Al Dosari',
        '유수프 악치체크': 'Yusuf Akçiçek',
        '파블로 마리': 'Pablo Marí',
        '무라드 알 하우사위': 'Murad Al Hawsawi',
        '사이몽 부압레': 'Saïmon Bouabré',
        '압둘카림 다리시': 'Abdulkarim Darisi',
        '술탄 만다쉬': 'Sultan Mandash',
        '카데르 메이테': 'Kader Meïté',
        '카림 벤제마': 'Karim Benzema',
        '파비뉴': 'Fabinho',
        '아흐메드 샤라힐리': 'Ahmed Sharahili',
        '무한나드 알 샹키티': 'Muhannad Al Shanqiti',
        '아와드 알 나슈리': 'Awad Al Nashri',
        '탈랄 하지': 'Talal Haji',
        '압둘라만 알 아부드': 'Abdulrahman Al Obood',
        '프레드라그 라이코비치': 'Predrag Rajković',
        '하메드 알 샹키티': 'Hamed Al Shanqiti',
        '모하메드 알 압시': 'Mohammed Al Absi',
        '얀카를로 시미치': 'Jan-Carlo Simić',
        '다닐루 페레이라': 'Danilo Pereira',
        '사드 알 무사': 'Saad Al Mousa',
        '스테판 켈러': 'Stefan Keller',
        '마리오 미타이': 'Mario Mitaj',
        '하산 카데쉬': 'Hassan Kadesh',
        '마하마두 둠비아': 'Mahamadou Doumbia',
        '파이살 알 감디': 'Faisal Al Ghamdi',
        '후셈 아우아르': 'Houssem Aouar',
        '스티븐 베르흐베인': 'Steven Bergwijn',
        '무사 디아비': 'Moussa Diaby',
        '로헤르 페르난데스': 'Roger Fernandes',
        '유세프 엔네시리': 'Youssef En-Nesyri',
        '조지 일레니헤나': 'George Ilenikhena',
        '살레 알 셰흐리': 'Saleh Al Shehri',
        '앨리스테어 존스턴': 'Alistair Johnston',
        '리암 스케일스': 'Liam Scales',
        '오스턴 트러스티': 'Auston Trusty',
        '조타': 'Jota',
        '베냐민 뉘그렌': 'Benjamin Nygren',
        '카스퍼 회그': 'Kasper Høgh',
        '미셸앙주 발리퀴샤': 'Michel-Ange Balikwisha',
        '카밀로 두란': 'Camilo Durán',
        '빌랴미 시니살로': 'Viljami Sinisalo',
        '양현준': 'Yang Hyun Jun',
        '루크 매코완': 'Luke McCowan',
        '세바스티안 토우넥티': 'Sebastian Tounekti',
        '칼럼 오스먼드': 'Callum Osmand',
        '캐머런 카터비커스': 'Cameron Carter-Vickers',
        '알렉스 옥슬레이드체임벌린': 'Alex Oxlade-Chamberlain',
        '미카 바우어': 'Mika Baur',
        '하이셈 하산': 'Haïssem Hassan',
        '조니 케니': 'Johnny Kenny',
        '로스 두핸': 'Ross Doohan',
        '아담 몽고메리': 'Adam Montgomery',
        '하타테 레오': 'Reo Hatate',
        '칼럼 맥그리거': 'Callum McGregor',
        '데인 머리': 'Dane Murray',
        '제임스 포레스트': 'James Forrest',
        '콜비 도노반': 'Colby Donovan',
        '안토니 랄스턴': 'Anthony Ralston',
        '키어런 티어니': 'Kieran Tierney',
        '프랑코 아르마니': 'Franco Armani',
        '세르히오 로메로': 'Sergio Romero',
        '세바스티안 메사': 'Sebastián Meza',
        '엔소 디아스': 'Enzo Díaz',
        '루카스 블론델': 'Lucas Blondel',
        '마르코스 로호': 'Marcos Rojo',
        '파브리시오 부스토스': 'Fabricio Bustos',
        '니콜라스 발렌티니': 'Nicolás Valentini',
        '에마누엘 맘마나': 'Emanuel Mammana',
        '가브리엘 로하스': 'Gabriel Rojas',
        '레오나르도 시갈리': 'Leonardo Sigali',
        '아구스틴 팔라베시노': 'Agustín Palavecino',
        '에세키엘 바르코': 'Ezequiel Barco',
        '크리스티안 메디나': 'Cristian Medina',
        '에키 페르난데스': 'Equi Fernández',
        '엔소 페레스': 'Enzo Pérez',
        '이그나시오 페르난데스': 'Ignacio Fernández',
        '후안 나르도니': 'Juan Nardoni',
        '페데리코 만쿠에요': 'Federico Mancuello',
        '미겔 보르자': 'Miguel Borja',
        '에딘손 카바니': 'Edinson Cavani',
        '다리오 베네데토': 'Darío Benedetto',
        '후안 페르난도 킨테로': 'Juan Fernando Quintero',
        '아담 바레이로': 'Adam Bareiro',
        '파쿤도 콜리디오': 'Facundo Colidio',
        '세르히오 라모스': 'Sergio Ramos',
        '루이스 말라곤': 'Luis Malagón',
        '나우엘 구스만': 'Nahuel Guzmán',
        '에스테반 안드라다': 'Esteban Andrada',
        '헤수스 가야르도': 'Jesús Gallardo',
        '케빈 알바레스': 'Kevin Álvarez',
        '이고르 리치노프스키': 'Igor Lichnovsky',
        '에릭 아기레': 'Érick Aguirre',
        '빅토르 구스만': 'Víctor Guzmán',
        '카를로스 살세도': 'Carlos Salcedo',
        '이스라엘 레예스': 'Israel Reyes',
        '기도 피사로': 'Guido Pizarro',
        '루이스 로모': 'Luis Romo',
        '디에고 발데스': 'Diego Valdés',
        '에릭 산체스': 'Érick Sánchez',
        '페르난도 고리아란': 'Fernando Gorriarán',
        '장 메네세스': 'Jean Meneses',
        '빅토르 포초 구스만': 'Víctor Guzmán',
        '알바로 피달고': 'Álvaro Fidalgo',
        '헨리 마르틴': 'Henry Martín',
        '앙드레 피에르 지냐크': 'André-Pierre Gignac',
        '기예르모 마르티네스': 'Guillermo Martínez',
        '훌리안 키뇨네스': 'Julián Quiñones',
        '니콜라스 이바녜스': 'Nicolás Ibáñez',
        '가브리엘 브라장': 'Gabriel Brazão',
        '휴고 소우자': 'Hugo Souza',
        '존 빅토르': 'John Victor',
        '구스타부 고메스': 'Gustavo Gómez',
        '레오 페레이라': 'Léo Pereira',
        '비토르 헤이스': 'Vitor Reis',
        '기예르메 아라나': 'Guilherme Arana',
        '브루누 푹스': 'Bruno Fuchs',
        '파브리시우 브루누': 'Fabrício Bruno',
        '카이키 브루노': 'Kaiki Bruno',
        '다닐루': 'Danilo',
        '가브리엘 사라': 'Gabriel Sara',
        '히오르히안 데 아라스카에타': 'Giorgian de Arrascaeta',
        '안드레아스 페레이라': 'Andreas Pereira',
        '안드레': 'André',
        '마테우스 페레이라': 'Matheus Pereira',
        '제르송': 'Gerson',
        '페드루': 'Pedro',
        '카를로스 비니시우스': 'Carlos Vinícius',
        '이고르 치아구': 'Igor Thiago',
        '델': 'Deivid Washington',
        '하양': 'Rayan',
        '가브리에우 바르보사': 'Gabriel Barbosa',
        '예페르손 소텔도': 'Yeferson Soteldo'
    };

    const noIdToOtherPos = new Map();
    for (const [kor, eng] of Object.entries(nameMap)) {
        const target = norm(eng);
        const matches = csvPlayers.filter(p => p.normKnown === target || p.normFull === target);
        if (matches.length > 0) {
            noIdToOtherPos.set(kor, matches[0].otherPositions);
        } else {
            const lastNameMatches = csvPlayers.filter(p => p.normLast === target);
            if (lastNameMatches.length === 1) {
                noIdToOtherPos.set(kor, lastNameMatches[0].otherPositions);
            }
        }
    }
    console.log(`Resolved ${noIdToOtherPos.size} manual players`);

    // 3. teamsData.backup_before_otherpositions.js 원본에서 읽기
    const originalContent = fs.readFileSync('easyfmm/teamsData.backup_before_otherpositions.js', 'utf-8');
    const lines = originalContent.split(/\r?\n/);
    console.log(`Original lines: ${lines.length}`);

    let updatedCount = 0;
    const newLines = [];

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        // 엄격한 선수 라인 판별:
        // 1) stadium이 포함된 라인은 제외
        // 2) name: "..." 과 position: "..." (또는 rating: ...) 이 함께 있는 선수 객체 라인
        if (!line.includes('stadium:') && line.includes('name:') && line.includes('position:')) {
            const nameMatch = line.match(/name:\s*"([^"]+)"/);
            if (nameMatch) {
                const playerName = nameMatch[1];
                const pidMatch = line.match(/playerid:\s*(\d+)/);

                let otherPositions = [];
                if (pidMatch) {
                    const pid = pidMatch[1];
                    const csvData = csvById.get(pid);
                    if (csvData && csvData.otherPositions) {
                        otherPositions = csvData.otherPositions;
                    }
                } else if (noIdToOtherPos.has(playerName)) {
                    otherPositions = noIdToOtherPos.get(playerName);
                }

                const formattedPositions = JSON.stringify(otherPositions);

                // 기존에 otherPositions가 이미 있는지 확인
                if (/otherPositions:\s*\[[^\]]*\]/.test(line)) {
                    line = line.replace(/otherPositions:\s*\[[^\]]*\]/, `otherPositions: ${formattedPositions}`);
                } else {
                    // detailPosition 뒤에 삽입
                    if (line.includes('detailPosition:')) {
                        line = line.replace(/(detailPosition:\s*"[^"]*")\s*,?/, `$1, otherPositions: ${formattedPositions},`);
                    } else if (line.includes('rating:')) {
                        line = line.replace(/(rating:\s*\d+)\s*,?/, `$1, otherPositions: ${formattedPositions},`);
                    } else {
                        line = line.replace(/(position:\s*"[^"]*")\s*,?/, `$1, otherPositions: ${formattedPositions},`);
                    }
                }

                // 끝부분 문법 정리 (예: ", }" -> " }")
                line = line.replace(/,\s*([}\]])/g, ' $1');

                updatedCount++;
            }
        }

        newLines.push(line);
    }

    console.log(`Processed ${updatedCount} player lines`);

    const teamsDataPath = 'easyfmm/teamsData.js';
    fs.writeFileSync(teamsDataPath, newLines.join('\n'), 'utf-8');
    console.log('Successfully written to easyfmm/teamsData.js!');
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
