
const BASE_URL = "https://test.local/wp-json/";

export async function fetchWP(params = {}) {

    let plugin = params.plugin || "wp";
    let version = params.version || "v2";
    let post = params.post || "posts";


    if (plugin == "wc" && !params.post) post = "products";
    if (plugin == "wc" && !params.version) version = "v3";

    let headers;
    if (plugin == "wc" || params.is_commerce) {
        const ck = "ck_08f96651041de9ee7355d3c63a6d41eef1714293";
        const cs = "cs_dff2b799c527da820682cd0b200179b3a64b1da0";

        // We must encode the keys for Basic Auth
        // btoa() converts text to Base64
        const authHeader = "Basic " + btoa(`${ck}:${cs}`);

        headers = {
            "Authorization": authHeader,
            "Content-type": "application/json"
        }

    }

    let url = BASE_URL + `${plugin}/${version}/${post}`;

    if (params.postId) {
        url += `/${params.postId}`;
    }
    else {
        url += '?';
        if (params.slug) {
            url += `slug=${params.slug}&`;
        }
        if (params.filters) {
            for (let f in params.filters)
                url += `${f}=${params.filters[f]}&`

        }
        if (params.fields) {
            for (let f in params.fields)
                url += `${f}=${params.fields[f]}&`;

        }
        if (params._embed) url += "_embed&";

        url = url.slice(0, url.length - 1);
    }

    const data = await fetch(url, {
        method: params.method || "GET",
        signal: params.signal || null,
        headers: headers,
        cache: params.cache || "force-cache"
    }).then(async res => {
        return {
            headers: res.headers,
            data: await res.json()
        }
    }, err => { throw new Error(err) });

    return data;
}

export function getPosts(params = {}) {
    let parameters = {
        post: "posts",
        _embed: true,
        ...params,
        filters: {
            per_page: 5,
            page: 1,
            ...(params.filters && params.filters)
        },
    }


    return fetchWP(parameters).then((res) => {
        return {
            totalPageNo: res.headers.get("x-wp-totalpages"),
            data: res.data.map((item, index, posts) => {
                return {
                    id: item.id,
                    title: item.title?.rendered,
                    feature_img: item._embedded["wp:featuredmedia"][0]?.source_url,
                    excerpt: item.excerpt?.rendered,
                    slug: item.slug,
                    status: item.status
                }
            })
        }
    }, err => { throw new Error("Error during parsing of json") });


}

export function getPOST(params = {}) {
    let parameters = {
        postId: params.postId,
        slug: params.slug,
        _embed: true,
        ...params,
    }

    if (!parameters.postId && !parameters.slug) throw new Error("postId or slug should be defined");

    return fetchWP(parameters).then((res) => {
        const item = res.data[0];

        return {
            data: {
                id: item.id,
                title: item.title.rendered,
                feature_img: item._embedded["wp:featuredmedia"][0]?.source_url,
                excerpt: item.excerpt?.rendered,
                slug: item.slug,
                status: item.status,
                content: item.content.rendered
            }
        }
    }, err => { throw new Error("Error during parsing of json") });
}

export function getProducts(params = {}) {
    let parameters = {
        plugin: "wc",
        filters: {
            per_page: 5,
            page: 1,
            ...params.filters
        },
        _embed: true,
        fields: params.fields
    }

    return fetchWP(parameters).then(res => {
        return {
            totalPageNo: res.headers.get("x-wp-totalpages"),
            data: res.data.map((item, index, products) => {
                return {
                    id: item.id,
                    title: item.name,
                    average_rating: item.average_rating,
                    price: item.sale_price || item.price,
                    regular_price: item.regular_price,
                    feature_img: item.images[0]?.thumbnail,
                    slug: item.slug,
                    categories: item.categories,
                    status: item.status
                }
            })
        }
    }, err => { throw new Error("Error during parsing of json") });
}

export function getPROD(params = {}) {
    let parameters = {
        plugin: "wc",
        postId: params.postId,
        slug: params.slug,
        ...params
    }

    if (!parameters.postId && !parameters.slug) throw new Error("postId or slug should be defined");

    return fetchWP(parameters).then(res => {
        const item = res.data[0];
        return {
            data: {
                id: item.id,
                title: item.name,
                average_rating: item.average_rating,
                regular_price: item.regular_price,
                price: item.sale_price || item.price,
                price_html: item.price_html,
                feature_img: item.images[0]?.thumbnail,
                short_description: item.short_description,
                description: item.description,
                slug: item.slug,
                categories: item.categories,
                status: item.status,
                images: item.images
            }
        }
    }, err => { throw new Error("Error during parsing of json") });
}

export function getProductReviews(productId, params = {}) {
    if(!productId) throw new Error("product id is missing");

    let parameters = {
        is_commerce: true,
        plugin: "wc/store",
        version: "v1",
        post: `products/reviews`,
        filters: {
            product_id: productId
        }

    }

    return fetchWP(parameters).then(res => {
        return {
            totalPageNo: res.headers.get("x-wp-totalpages"),
            data: res.data.map((rev, index) => {
                return {
                    id: rev.id,
                    product_id: rev.product_id,
                    date_created: rev.date_created,
                    rating: rev.rating,
                    reviewer: rev.reviewer,
                    review: rev.review,
                    verified: false,
                    reviewer_avatar_urls: rev.reviewer_avatar_urls
                }
            
        })}
    }, err => {throw new Error("error during parsing of json")});
}

export function getSearch(searchString, pageNo, post = "post"){

    if(!searchString ||  !searchString.trim()) throw new Error("search string is missing");

    let parameters = {
        filters: {
            page: pageNo,
            "search":searchString
        }
    };

    if(post == "post") return getPosts(parameters);
    else if(post == "product") return getProducts(parameters);
}