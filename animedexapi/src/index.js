import {
    getSearch,
    getAnime,
    getRecentAnime,
    getPopularAnime,
    getEpisode,
    GogoDLScrapper,
    getGogoAuthKey,
} from "./gogo";

import {
    getAnilistTrending,
    getAnilistSearch,
    getAnilistAnime,getAnilistUpcoming
} from "./anilist";

let CACHE = {};
let HOME_CACHE = {};
let ANIME_CACHE = {};
let SEARCH_CACHE = {};
let REC_CACHE = {};
let RECENT_CACHE = {};
let GP_CACHE={}
let AT_CACHE={}

export default {
    async fetch(request, env, ctx) {
        const url = request.url;

        if (url.includes("/search/")) {
            let query, page;
            try {
                if (url.includes("?page=")) {
                    query = url.split("/search/")[1].split("?")[0];
                    page = url.split("/search/")[1].split("?page=")[1];
                } else {
                    query = url.split("/search/")[1];
                    page = 1;
                }
            } catch (err) {
                query = url.split("/search/")[1];
                page = 1;
            }

            if (SEARCH_CACHE[query + page.toString()] != null) {
                const t1 = Math.floor(Date.now() / 1000);
                const t2 = SEARCH_CACHE[`time_${query + page.toString()}`];
                if (t1 - t2 < 60 * 60) {
                    const json = JSON.stringify({
                        results: SEARCH_CACHE[query + page.toString()],
                    });
                    return new Response(json, {
                        headers: { "Access-Control-Allow-Origin": "*" },
                    });
                }
            }
            const data = await getSearch(query, page);
            SEARCH_CACHE[query + page.toString()] = data;
            SEARCH_CACHE[`time_${query + page.toString()}`] = Math.floor(
                Date.now() / 1000
            );
            const json = JSON.stringify({ results: data });

            return new Response(json, {
                headers: { "Access-Control-Allow-Origin": "*" },
            });
        } else if (url.includes("/home")) {
            if (HOME_CACHE["data"] != null) {
                const t1 = Math.floor(Date.now() / 1000);
                const t2 = HOME_CACHE["time"];
                if (t1 - t2 < 60 * 60) {
                    const json = JSON.stringify({
                        results: HOME_CACHE["data"],
                    });
                    return new Response(json, {
                        headers: { "Access-Control-Allow-Origin": "*" },
                    });
                }
            }
            let anilistTrending = [];
            let gogoPopular = [];
            try {
                anilistTrending = (await getAnilistTrending())["results"];
            } catch (err) {
                anilistTrending = [];
                console.log(err);
            }
            try {
                gogoPopular = await getPopularAnime();
            } catch (err) {
                gogoPopular = [];
            }
            const data = { anilistTrending, gogoPopular };
            HOME_CACHE["data"] = data;
            HOME_CACHE["time"] = Math.floor(Date.now() / 1000);
            const json = JSON.stringify({ results: data });

            return new Response(json, {
                headers: { "Access-Control-Allow-Origin": "*" },
            });
        } else if (url.includes("/anime/")) {
            let anime = url.split("/anime/")[1];

            if (ANIME_CACHE[anime] != null) {
                const t1 = Math.floor(Date.now() / 1000);
                const t2 = ANIME_CACHE[`time_${anime}`];
                if (t1 - t2 < 60 * 60) {
                    const json = JSON.stringify({
                        results: ANIME_CACHE[anime],
                    });
                    return new Response(json, {
                        headers: { "Access-Control-Allow-Origin": "*" },
                    });
                }
            }
            let data;
            try {
                data = await getAnime(anime);
                if (data.name == "") {
                    throw new Error("Not found");
                }
                data.source = "gogoanime";
            } catch (err) {
                try {
                    // try to get by search on gogo
                    const search = await getSearch(anime);
                    anime = search[0].id;
                    data = await getAnime(anime);
                    data.source = "gogoanime";
                } catch (err) {
                    // try to get by search on anilist
                    const search = await getAnilistSearch(anime);
                    anime = search["results"][0].id;
                    data = await getAnilistAnime(anime);
                    data.source = "anilist";
                }
            }

            if (data == {}) {
                throw new Error("Not found");
            }
            ANIME_CACHE[anime] = data;
            ANIME_CACHE[`time_${anime}`] = Math.floor(Date.now() / 1000);
            const json = JSON.stringify({ results: data });

            return new Response(json, {
                headers: { "Access-Control-Allow-Origin": "*" },
            });
        } else if (url.includes("/episode/")) {
            const id = url.split("/episode/")[1];
            const data = await getEpisode(id);
            const json = JSON.stringify({ results: data });

            return new Response(json, {
                headers: { "Access-Control-Allow-Origin": "*" },
            });
        } else if (url.includes("/download/")) {
            const query = url.split("/download/")[1];
            const timeValue = CACHE["timeValue"];
            const cookieValue = CACHE["cookieValue"];

            let cookie = "";

            if (timeValue != null && cookieValue != null) {
                const currentTimeInSeconds = Math.floor(Date.now() / 1000);
                const timeDiff = currentTimeInSeconds - timeValue;

                if (timeDiff > 10 * 60) {
                    cookie = await getGogoAuthKey();
                    CACHE.cookieValue = cookie;
                } else {
                    cookie = cookieValue;
                }
            } else {
                const currentTimeInSeconds = Math.floor(Date.now() / 1000);
                CACHE.timeValue = currentTimeInSeconds;
                cookie = await getGogoAuthKey();
                CACHE.cookieValue = cookie;
            }

            const data = await GogoDLScrapper(query, cookie);

            const json = JSON.stringify({ results: data });
            return new Response(json, {
                headers: { "Access-Control-Allow-Origin": "*" },
            });
        } else if (url.includes("/recent/")) {
            const page = url.split("/recent/")[1];

            if (RECENT_CACHE[page] != null) {
                const t1 = Math.floor(Date.now() / 1000);
                const t2 = RECENT_CACHE[`time_${page}`];
                if (t1 - t2 < 5 * 60) {
                    const json = JSON.stringify({
                        results: RECENT_CACHE[page],
                    });
                    return new Response(json, {
                        headers: { "Access-Control-Allow-Origin": "*" },
                    });
                }
            }

            const data = await getRecentAnime(page);
            const json = JSON.stringify({ results: data });

            RECENT_CACHE[page] = data;
            RECENT_CACHE[`time_${page}`] = Math.floor(Date.now() / 1000);

            return new Response(json, {
                headers: { "Access-Control-Allow-Origin": "*" },
            });
        } else if (url.includes("/recommendations/")) {
            let anime = url.split("/recommendations/")[1];

            if (REC_CACHE[anime] != null) {
                const t1 = Math.floor(Date.now() / 1000);
                const t2 = REC_CACHE[`time_${anime}`];
                if (t1 - t2 < 60 * 60) {
                    const json = JSON.stringify({
                        results: REC_CACHE[anime],
                    });
                    return new Response(json, {
                        headers: { "Access-Control-Allow-Origin": "*" },
                    });
                }
            }

            const search = await getAnilistSearch(anime);
            anime = search["results"][0].id;
            let data = await getAnilistAnime(anime);
            data = data["recommendations"];
            REC_CACHE[anime] = data;
            const json = JSON.stringify({ results: data });

            return new Response(json, {
                headers: { "Access-Control-Allow-Origin": "*" },
            });
        }else if (url.includes("/gogoPopular/")) {
            let page = url.split("/gogoPopular/")[1];

            if (GP_CACHE[page] != null) {
                const t1 = Math.floor(Date.now() / 1000);
                const t2 = GP_CACHE[`time_${page}`];
                if (t1 - t2 < 10 * 60) {
                    const json = JSON.stringify({
                        results: GP_CACHE[page],
                    });
                    return new Response(json, {
                        headers: { "Access-Control-Allow-Origin": "*" },
                    });
                }
            }
            
            let data = await getPopularAnime(page,20);
            GP_CACHE[page] = data;
            
            const json = JSON.stringify({ results: data });

            return new Response(json, {
                headers: { "Access-Control-Allow-Origin": "*" },
            });
        } else if (url.includes("/upcoming/")) {
            let page = url.split("/upcoming/")[1];

            if( AT_CACHE[page] != null) {
                const t1 = Math.floor(Date.now() / 1000);
                const t2 = AT_CACHE[`time_${page}`];
                if (t1 - t2 < 60 * 60) {
                    const json = JSON.stringify({
                        results: AT_CACHE[page],
                    });
                    return new Response(json, {
                        headers: { "Access-Control-Allow-Origin": "*" },
                    });
                }
            }

            let data = await getAnilistUpcoming(page);
            data=data['results'];
            AT_CACHE[page] = data;
            
            const json = JSON.stringify({ results: data });

            return new Response(json, {
                headers: { "Access-Control-Allow-Origin": "*" },
            });
        }

        const text = `Api Is Up... Support : https://telegram.me/TechZBots_Support 
        
Routes :
        
/home
/search/{query}
/anime/{id}
/episode/{id}
/download/{id}
/recent/{page}
/recommendations/{id}
/gogoPopular/{page}
/upcoming/{page}
        `;
        return new Response(text, {
            headers: { "content-type": "text/plain" },
        });
    },
};
