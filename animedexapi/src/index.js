import {
    getSearch,
    getAnime,
    getRecentAnime,
    getPopularAnime,
    getEpisode,
    GogoDLScrapper,
    getGogoAuthKey,
} from "./gogo";

import { getAnilistTrending } from "./anilist";

const CACHE = {};

export default {
    async fetch(request, env, ctx) {
        const url = request.url;

        if (url.includes("/search/")) {
            const query = url.split("/search/")[1];
            const data = await getSearch(query);
            const json = JSON.stringify({ results: data });

            return new Response(json, {
                headers: { "Access-Control-Allow-Origin": "*" },
            });
        } else if (url.includes("/home")) {
            const anilistTrending = await getAnilistTrending();
            const gogoPopular = await getPopularAnime();
            const gogoRecent = await getRecentAnime();
            const data = { anilistTrending, gogoPopular, gogoRecent };
            const json = JSON.stringify({ results: data });

            return new Response(json, {
                headers: { "Access-Control-Allow-Origin": "*" },
            });
        } else if (url.includes("/anime/")) {
            const id = url.split("/anime/")[1];
            const data = await getAnime(id);
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
