import { useContext, useState, useEffect, Suspense, use, useMemo} from "react";
import { RouteContext } from "../Router";
import Loading from "../components/Loading";
import { Link } from "../Router";
import { getPROD, getProductReviews } from "../fetch-helper";
import ErrorHandler from '../components/ErrorHandler.jsx'
import '../assets/css/product.css'

export default function Product() {
    const { params } = useContext(RouteContext);

    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [data, setData] = useState({});

    const slug = params.slug;

    const loadProduct = async () => {
        try {
            await getPROD({ slug }).then(res => {
                setData(res.data)
            });
        } catch (err) {
            setHasError(true);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadProduct();
    }, [slug]);

    if (isLoading) return <Loading />

    if (hasError) return <ErrorHandler reset={loadProduct}>something went wrong... </ErrorHandler>

    return (

        <>
            <div className={"prod"}>
                <div className="prod-images"><ImageCoursel images={data.images} /></div>
                <div className="info">
                    <div className="categories">
                     {data.categories.map((category,index)=>{
                       return <Link key={category.id} className={"pill category category-" + category.id} href={`/products/category/${category.id}`}>{category.name}</Link> 
                    })}</div>
                    <h2 className='title poppins-bold'> {data.title}</h2>
                    <div className="price"><del className="regular-price">Rs: {data.regular_price}</del>
                    <span className="sale-price"><strong>Rs: {data.price}</strong></span></div>
                    <div className="short-desc" dangerouslySetInnerHTML={{ __html: data.short_description }}></div>
                    <form action={location.pathname} method="GET">
                   <input type="hidden" value={data.id} name="add_to_cart"/>
                   <button type="submit" className="add-to-cart">Add to Cart</button>
                   </form>
                </div>
            </div>
            <Reviews productId={data.id} />
        </>
    )
}

export function ImageCoursel({ images }) {
    const [imgActiveIndex, setImgActiveIndex] = useState(0);

    const goPrevImg = () => {
        setImgActiveIndex(p => Math.max(0, p - 1))
    }
    const goNextImg = () => {
        setImgActiveIndex(p => Math.min(images.length - 1, p + 1))
    }

    return (
        <div className="img-coursel">
            <button className="prev" onClick={goPrevImg}>&lt;</button>
            <button className="next" onClick={goNextImg}>&gt;</button>
            <div className="images">
                {images.map((img, index) => {
                    return <img key={img.id} className={imgActiveIndex == index ? "active" : ""} src={img.src} alt={img.alt} />
                })}
            </div>
        </div>
    )
}

export function Reviews({productId}){

    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [data, setData] = useState({});
    const [pageNo, setPageNo] = useState(1);

    const loadReviews = async () => {
        try {
            await getProductReviews(productId , {
                filters:{
                    per_page:5,
                    page:pageNo
                }
            }).then(res => {
                setData(res.data)
            });
        } catch (err) {
            setHasError(true);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadReviews();
    }, [pageNo]);

    if (isLoading) return <Loading />

    if (hasError) return <ErrorHandler reset={loadReviews}>something went wrong... </ErrorHandler>
    
    if(data.length == 0) return <p>No review yet. Be First Review.... </p>
    return (
        <div className="reviews">
            {data.map((rev, index)=>{
                return <div key={rev.id} className="review">
                    <div className="avatar">
                        <img width="60px" height="60px" src={rev.reviewer_avatar_urls["48"]}/>
                    </div>
                    <div className="rev">
                        <div className="info">
                            <div className="reviewer">{rev.reviewer}</div>
                            <div className="data-created">{rev.date_created}</div>
                            <div className="rating">Rating: {rev.rating}</div>
                        </div>
                        <div className="review-text" dangerouslySetInnerHTML={{__html:rev.review}}></div>
                    </div>
                </div>
            })}
        </div>
    )
}