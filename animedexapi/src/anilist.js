async function getAnilistTrending() {
    const res = await fetch(
        "https://techzapi.up.railway.app/meta/anilist/trending?perPage=10"
    );
    const data = await res.json();
    return data;
}

async function getAnilistSearch(query) {
    const res = await fetch(
        `https://techzapi.up.railway.app/meta/anilist/${query}?perPage=1`
    );
    const data = await res.json();
    return data;
}

async function getAnilistAnime(id) {
    const res = await fetch(
        `https://techzapi.up.railway.app/meta/anilist/info/${id}`
    );
    const data = await res.json();
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
        recommendations: data["recommendations"],
    };
    return results;
}

export { getAnilistTrending, getAnilistSearch, getAnilistAnime };
