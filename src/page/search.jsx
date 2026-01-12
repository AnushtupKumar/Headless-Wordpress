import React, { useState, useContext, useRef, useEffect, useMemo } from "react";
import { getSearch } from "../fetch-helper";
import { PostItem, NavigatePages, LazyLoad } from "../App";
import { ProductItem } from "./Shop";
import '../assets/css/shop.css'


const SearchPageContext = React.createContext();

export default function SearchPage() {

    const queryStrings = new URLSearchParams(location.search);

    const postType = queryStrings.get("post") || "post";
    const pageNo = queryStrings.get("page") || 1;
    const searchString = queryStrings.get("s") || "";

    const promise = useMemo(() => getSearch(searchString, pageNo, postType), [pageNo, postType, searchString]);

    return <>
    <SearchPageContext.Provider value={{
        "postType": postType,
        "pageNo": pageNo,
        "searchString": searchString
    }}>
        <SearchForm />

        <div className={postType == "product" ? "products" : "posts"}>
            <LazyLoad promise={promise}>
                {({ data, totalPageNo }) => {
                    
                    return <>
                    <Posts data={data} postType={postType}/>
                     <NavigatePages navigateTo={`/search?s=${searchString}&post=${postType}&page=`} currentPageNo={pageNo} totalPageNo={totalPageNo} />
                    </> 
                    }}
            </LazyLoad>
        </div>

                    </SearchPageContext.Provider>
    </>
}

function Posts({ data, postType }) {
    return data.length > 0 ? data.map(item => {
        if (postType == "product") return <ProductItem key={item.id} data={item} />
        return <PostItem key={item.id} data={item} />
    }) : "No search result found for your query"
}

export function SearchForm() {
    const {searchString, postType} = useContext(SearchPageContext);

    return <>

        <form action="/search" className="search-form card">
            <select name="post" defaultValue={postType}>
                <option value="post" >Post</option>
                <option value="product" >Product</option>
            </select>
            <input className="search-input" type="text" name="s" value={searchString} onChange={(e) => setSearchString(e.target.value)} />
            <input className="search-submit" type="submit" value="Search" />
        </form>
    </>
}