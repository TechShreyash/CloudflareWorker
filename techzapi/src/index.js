async function scrapGogoEpisodes(animeid) {
    const response = await fetch(`https://gogoanimehd.io/category/${animeid}`);
    const html = await response.text();
    const cheerio = require("cheerio");
    const body = cheerio.load(html);
    const ul = body("ul#episode_page").find("a").text().split("-")[1];
    return ul;
}

async function GogoDLScrapper(animeid, cookie) {
    try {
        cookie = atob(cookie);
        const response = await fetch(`https://gogoanimehd.io/${animeid}`, {
            headers: {
                Cookie: `auth=${cookie}`,
            },
        });
        const html = await response.text();
        const cheerio = require("cheerio");
        const body = cheerio.load(html);
        let data = {};
        const links = body("div.cf-download").find("a");
        links.each((i, link) => {
            const a = body(link);
            data[a.text().trim()] = a.attr("href").trim();
        });
        return data;
    } catch (e) {
        return e;
    }
}

async function getGogoAuthKey() {
    const response = await fetch(
        "https://api.github.com/repos/TechShreyash/TechShreyash/contents/gogoCookie.txt",
        {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Linux; Android 9; vivo 1916) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Mobile Safari/537.36",
            },
        }
    );
    const data = await response.json();
    const cookie = data["content"].replaceAll("\n", "");
    return cookie;
}

export default {
    async fetch(request, env, ctx) {
        const url = request.url;

        if (url.includes("/gogo/episodes/")) {
            const animeid = url.split("/gogo/episodes/")[1];
            const episodes = await scrapGogoEpisodes(animeid);
            const data = {
                total: episodes,
            };

            const json = JSON.stringify(data, null, 2);
            return new Response(json, {
                headers: { "Access-Control-Allow-Origin": "*" },
            });
        } else if (url.includes("/gogo/search/")) {
            const query = url.split("/gogo/search/")[1];
            const data = await searchGogo(query);

            return new Response(data, {
                headers: { "Access-Control-Allow-Origin": "*" },
            });
        } else if (url.includes("/gogo/dl/")) {
            const query = url.split("/gogo/dl/")[1];
            const timeValue = await env.TODO.get("timeValue");
            const cookieValue = await env.TODO.get("cookieValue");
            let cookie = "";

            if (timeValue && cookieValue) {
                const currentTimeInSeconds = Math.floor(Date.now() / 1000);
                const timeDiff = currentTimeInSeconds - timeValue;

                if (timeDiff > 10 * 60) {
                    cookie = await getGogoAuthKey();
                    await env.TODO.put("cookieValue", cookie);
                } else {
                    cookie = cookieValue;
                }
            } else {
                const currentTimeInSeconds = Math.floor(Date.now() / 1000);
                await env.TODO.put("timeValue", currentTimeInSeconds);
                cookie = await getGogoAuthKey();
                await env.TODO.put("cookieValue", cookie);
            }

            const data = await GogoDLScrapper(query, cookie);

            const json = JSON.stringify(data, null, 2);
            return new Response(json, {
                headers: { "Access-Control-Allow-Origin": "*" },
            });
        }

        return new Response("Hello worker!", {
            headers: { "content-type": "text/plain" },
        });
    },
};
