function anilistSearchQuery(query, page, perPage = 10, type = "ANIME") {
    return `query ($page: Int = ${page}, $id: Int, $type: MediaType = ${type}, $search: String = "${query}", $isAdult: Boolean = false, $size: Int = ${perPage}) { Page(page: $page, perPage: $size) { pageInfo { total perPage currentPage lastPage hasNextPage } media(id: $id, type: $type, search: $search, isAdult: $isAdult) { id idMal status(version: 2) title { userPreferred romaji english native } bannerImage popularity coverImage{ extraLarge large medium color } episodes format season description seasonYear chapters volumes averageScore genres nextAiringEpisode { airingAt timeUntilAiring episode }  } } }`;
}

function anilistTrendingQuery(page = 1, perPage = 10, type = "ANIME") {
    return `query ($page: Int = ${page}, $id: Int, $type: MediaType = ${type}, $isAdult: Boolean = false, $size: Int = ${perPage}, $sort: [MediaSort] = [TRENDING_DESC, POPULARITY_DESC]) { Page(page: $page, perPage: $size) { pageInfo { total perPage currentPage lastPage hasNextPage } media(id: $id, type: $type, isAdult: $isAdult, sort: $sort) { id idMal status(version: 2) title { userPreferred romaji english native } genres trailer { id site thumbnail } description format bannerImage coverImage{ extraLarge large medium color } episodes meanScore duration season seasonYear averageScore nextAiringEpisode { airingAt timeUntilAiring episode }  } } }`;
}

function anilistMediaDetailQuery(id) {
    return `query ($id: Int = ${id}) { Media(id: $id) { id idMal title { english native romaji } synonyms coverImage { extraLarge large color } startDate { year month day } endDate { year month day } bannerImage season seasonYear description type format status(version: 2) episodes duration genres source averageScore popularity meanScore recommendations { edges { node { id mediaRecommendation { id idMal title { romaji english native userPreferred } status episodes coverImage { extraLarge large medium color } bannerImage format chapters meanScore nextAiringEpisode { episode timeUntilAiring airingAt } } } } } } }`;
}
async function getAnilistTrending() {
    const url = "https://graphql.anilist.co";
    const query = anilistTrendingQuery();
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({
            query: query,
        }),
    };
    const res = await fetch(url, options);
    let data = await res.json();
    data = {
        results: data["data"]["Page"]["media"],
    };
    return data;
}

async function getAnilistSearch(query) {
    const url = "https://graphql.anilist.co";
    query = anilistSearchQuery(query, 1, 1);
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({
            query: query,
        }),
    };
    const res = await fetch(url, options);
    let data = await res.json();
    data = {
        results: data["data"]["Page"]["media"],
    };
    return data;
}

async function getAnilistAnime(id) {
    const url = "https://graphql.anilist.co";
    console.log(id);
    const query = anilistMediaDetailQuery(id);
    console.log(query);
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({
            query: query,
        }),
    };
    const res = await fetch(url, options);
    let data = await res.json();
    data = data["data"]["Media"];
    const results = {
        id: data["id"],
        title: data["title"],
        image: data["image"],
        cover: data["cover"],
        description: data["description"],
        status: data["status"],
        releaseDate: data["releaseDate"],
        totalEpisodes: data["totalEpisodes"],
        genres: data["genres"],
        type: data["type"],
        recommendations: data["recommendations"]["edges"],
    };

    for (let i = 0; i < results["recommendations"].length; i++) {
        const rec = results["recommendations"][i];
        results["recommendations"][i] = rec["node"]["mediaRecommendation"];
    }
    return results;
}

export { getAnilistTrending, getAnilistSearch, getAnilistAnime };
