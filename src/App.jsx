import './App.css'
import React, { useState, useEffect, useContext, useRef, use, Suspense, useMemo } from 'react'
import { Route, Router, Link, RouteContext } from './Router';
import PostPage from './Post';
import Loading from './components/Loading';
import Header from './components/Header';
import Shop, { ProductItem } from './page/Shop';
import Product from './page/Product';
import { getPosts, getSearch } from './fetch-helper';
import ErrorHandler from './components/ErrorHandler';
import ArchivePage from './page/archive';
import SearchPage from './page/search';
import { ErrorBoundary } from 'react-error-boundary';

export function Animate({ children, show, duration, classToAddAtStart, classToAddAtEnd }) {
    const [isExiting, setIsExiting] = useState(false);
    const [isSuspended, setIsSuspended] = useState(false);
    const ref = useRef();

    const handleAnimationEnd = (e) => {
        setIsSuspended(true);
        setIsExiting(false);
    }

    useEffect(() => {
        if (show) {
            setIsSuspended(false);
            setIsExiting(false);
        }
        else {
            setIsExiting(true);
        }
    }, [show]);

    let className = "";
    let style = {};

    if (duration) style.animationDuration = duration;

    if (!isExiting && isSuspended) return <></>

    if (isExiting) className += classToAddAtEnd;

    return (
        <>
            <div ref={ref} onTransitionEnd={handleAnimationEnd} onAnimationEnd={handleAnimationEnd} className={"animate-wrapper " + className} style={style}>{children}</div>
        </>
    )

}


const LazyLoadContext = React.createContext();

export function LazyLoad({promise, fallback = <Loading />, errorFallback = <ErrorHandler reset={function () { }}>Something went wrong</ErrorHandler>, children }) {
    
    return <ErrorBoundary fallback={errorFallback}>
        <Suspense fallback={fallback}>
            <Wait promise={promise} children={children}>
            </Wait>
        </Suspense>
    </ErrorBoundary>
}

function Wait({promise, children}){
    const data = use(promise);
    if(children instanceof Function) return children(data);
    return  <LazyLoadContext.Provider value={data}>
        {children}
    </LazyLoadContext.Provider>
}


function App() {

    return (<>
        <Router>
            <Header />
            <Route path="/blog"><BlogPage /> </Route>
            <Route path="/blog/page/${pageNo}"><BlogPage /> </Route>
            <Route path="/post/${slug}"><PostPage /></Route>
            <Route path="/shop"><Shop /></Route>
            <Route path="/shop/page/${pageNo}"><Shop /></Route>
            <Route path="/product/${slug}"><Product /></Route>
            <Route path="/products/category/${categoryId}"><ArchivePage /> </Route>
            <Route path="/products/category/${categoryId}/page/${pageNo}"><ArchivePage /> </Route>
            <Route path="/search"><SearchPage/></Route>
        </Router>
    </>
    );


}

export default App


export function BlogPage() {

    const { params } = useContext(RouteContext);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [data, setData] = useState([]);

    const totalPageNo = useRef();

    async function loadPosts() {
        if (!isLoading) setIsLoading(true);
        try {
            await getPosts({
                filters: {
                    page: params.pageNo || 1
                }
            }).then(res => {
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
    }, [params.pageNo || 1])

    if (isLoading) return <Loading />

    if (hasError) return <ErrorHandler reset={loadPosts}>Something went wrong</ErrorHandler>

    return (
        <>
            <div className="posts">
                {data.map((item, index) => {
                    return <PostItem key={item.id} data={item} />
                })}
            </div>
            <NavigatePages currentPageNo={params.pageNo || 1} totalPageNo={totalPageNo.current} />
        </>
    )
}

export function PostItem({ data }) {

    return (
        <div className={`post-item poppins-regular card post-${data.id}`}>

            <picture className="feature-img">
                <source media='min-width: 990px' src={data.feature_img} type="image/" />
                <img src={data.feature_img} alt='dummy' />
            </picture>
            <h2 className='title poppins-bold'><Link href={"/post/" + data.slug} dangerouslySetInnerHTML={{ __html: data.title }}></Link></h2>
            <div className="excerpt" dangerouslySetInnerHTML={{ __html: data.excerpt }}></div>
        </div>
    )
}


export function NavigatePages({ totalPageNo, currentPageNo, navigateTo = "/blog/page/" }) {
    let html = [];
    for (let i = 1; i <= Number(totalPageNo); i++) {
        let className = "navigate-pages-btn";
        if (i == currentPageNo) className += " active";
        html.push(<Link key={i} href={`${navigateTo}${i}`} className={className}>{i}</Link>)
    }
    return (
        <>
            <div className="pagination">
                {html.map(v => v)}
            </div>
        </>
    )
}
