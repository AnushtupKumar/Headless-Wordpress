import { useContext, useEffect , useRef, useState } from "react";
import Loading from "../components/Loading";
import { Link, RouteContext } from "../Router";
import { getProducts } from "../fetch-helper";
import ErrorHandler from "../components/ErrorHandler";
import { NavigatePages } from "../App";
import '../assets/css/shop.css'

export default function Shop() {
    const {params} = useContext(RouteContext);

    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [data, setData] = useState({});

    const totalPageNo = useRef();

    let pageNo = params.pageNo || 1;

   const loadProducts = async ()=>{
            if(!isLoading) setIsLoading(true);

        try {
            await getProducts({
                filters:{
                   page: pageNo
                }
            }).then(res=>{
                totalPageNo.current = res.totalPageNo;
                setData(res.data);
            })
        } catch (error) {
            setHasError(true);
        }finally{
            setIsLoading(false);
        }
   }
    useEffect(() => {
       loadProducts();
    }, [pageNo]);

    if(isLoading) return <Loading/>
    
    if(hasError) return <ErrorHandler reset={loadProducts}>something went wrong...</ErrorHandler>

    return (
        <>
        <div className="products">
        {data.map((value, index)=>{
            return <ProductItem key={value.id} data={value}></ProductItem>
        })}

        <NavigatePages navigateTo="/shop/page/" currentPageNo={params.pageNo || 1} totalPageNo={totalPageNo.current}></NavigatePages>
        </div>
        </>
    )

}

export function ProductItem({data}){
    return (<>
         <div className={`prod-item prod-${data.id}`}>
               
                   <picture className="feature-img">
                        <source media='min-width: 990px' src={data.feature_img} type="image/" />
                        <img src={data.feature_img} alt="" />
                    </picture> 
                     <div className="categories">
                    {data.categories.map((category,index)=>{
                       return <Link key={category.id} className={"pill category category-" + category.id} href={`/products/category/${category.id}`}>{category.name}</Link> 
                    })}
                </div>
                    <h2 className='title'><Link href={"/product/" + data.slug}>{data.title}</Link></h2>
                    <div className="price"><del className="regular-price">Rs: {data.regular_price}</del>
                    <span className="sale-price"><strong>Rs: {data.price}</strong></span></div>
                   <form action={location.pathname} method="GET">
                   <input type="hidden" value={data.id} name="add_to_cart"/>
                   <button type="submit" className="add-to-cart">Add to Cart</button>
                   </form>
                </div>
    </>)
}

