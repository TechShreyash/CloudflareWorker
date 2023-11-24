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
    getAnilistAnime,
} from "./anilist";

const CACHE = {};
const HOME_CACHE = {};
const ANIME_CACHE = {};
const SEARCH_CACHE = {};
const REC_CACHE = {};

export default {
    async fetch(request, env, ctx) {
        const url = request.url;

        if (url.includes("/search/")) {
            const query = url.split("/search/")[1];
            if (SEARCH_CACHE[query] != null) {
                const t1 = Math.floor(Date.now() / 1000);
                const t2 = SEARCH_CACHE[`time_${query}`];
                if (t1 - t2 < 60 * 60) {
                    const json = JSON.stringify({
                        results: SEARCH_CACHE[query],
                    });
                    return new Response(json, {
                        headers: { "Access-Control-Allow-Origin": "*" },
                    });
                }
            }
            const data = await getSearch(query);
            SEARCH_CACHE[query] = data;
            SEARCH_CACHE[`time_${query}`] = Math.floor(Date.now() / 1000);
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
                // try to get by id on gogo
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

                if (timeDiff > 30 * 60) {
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
            const data = await getRecentAnime(page);
            const json = JSON.stringify({ results: data });

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
        }

        return new Response("Hello worker!", {
            headers: { "content-type": "text/plain" },
        });
    },
};
