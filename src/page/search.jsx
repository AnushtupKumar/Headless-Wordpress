import { useState, useContext, useRef, useEffect } from "react";
import Loading from "../components/Loading";
import ErrorHandler from "../components/ErrorHandler";
import { getSearch } from "../fetch-helper";
import { PostItem, NavigatePages } from "../App";
import { ProductItem } from "./Shop";
import '../assets/css/shop.css'

export default function SearchPage() {
    
    const queryStrings = new URLSearchParams(location.search);

    const postType = queryStrings.get("post") || "post";
    const pageNo = queryStrings.get("page") || 1;
    

    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [data, setData] = useState([]);

    const totalPageNo = useRef();

    const loadPosts = async () => {
        if (!isLoading) setIsLoading(true);
        try {
            await getSearch(queryStrings.get("s"), pageNo, postType).then(res => {
                totalPageNo.current = res.totalPageNo;
                setData(res.data);
                setHasError(false);
            })
        } catch (err) {
            setHasError(true);
        } finally {
            setIsLoading(false);
        }
    }
    
    useEffect(() => {
        loadPosts();
    }, [pageNo]);
    
    if (isLoading) return <Loading />

    if (hasError) return <ErrorHandler reset={loadPosts}>Something went wrong</ErrorHandler>

    return <>
        <SearchForm/>

        <div className={postType == "product" ? "products": "posts"}>
            {data.length > 0 ? data.map((item, index) => {
                if(postType == "product") return <ProductItem key={item.id} data={item}/>
                return <PostItem key={item.id} data={item} />
            }) : "No search result found for your query"}
        </div>
        <NavigatePages navigateTo={`/search?s=${queryStrings.get("s")}&post=${postType}&page=`} currentPageNo={pageNo} totalPageNo={totalPageNo.current} />


    </>
}

export function SearchForm(){
    const queryStrings = new URLSearchParams(location.search);
    const [searchString, setSearchString] = useState(queryStrings.get("s"));

    return <>
    
    <form action="/search" className="search-form card">
            <select name="post">
                <option value="post">Post</option>
                <option value="product">Product</option>
            </select>
            <input className="search-input" type="text" name="s" value={searchString} onChange={(e) => setSearchString(e.target.value)} />
            <input className="search-submit" type="submit" value="Search"/>
        </form>
    </>
}