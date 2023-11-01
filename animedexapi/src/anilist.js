async function getAnilistTrending() {
    const res = await fetch(
        "https://techzapi.up.railway.app/meta/anilist/trending?perPage=10"
    );
    const data = await res.json();
    return data;
}

export { getAnilistTrending };
