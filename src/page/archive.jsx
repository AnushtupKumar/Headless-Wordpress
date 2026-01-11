import React, {useState, useRef, useContext, useEffect} from 'react'
import { RouteContext } from '../Router';
import { ProductItem } from "./Shop";
import Loading from "../components/Loading";
import { NavigatePages } from "../App";
import '../assets/css/shop.css'
import ErrorHandler from '../components/ErrorHandler';
import { getProducts } from '../fetch-helper';

export default function ArchivePage(){
    const {params} = useContext(RouteContext);
    
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [data, setData] = useState({});

    const totalPageNo = useRef();

       const loadProducts = async ()=>{
        console.log(params)
            try {
               if(!params.categoryId) throw new Error("category id is missing")
                await getProducts({
                    filters:{
                       page: params.pageNo || 1,
                       category: params.categoryId
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
        }, [params.pageNo || 1]);
    
        if(isLoading) return <Loading/>
    
        if(hasError) return <ErrorHandler reset={loadProducts}>something went wrong...</ErrorHandler>
    
        return (
            <>
            <div className="products">
            {data.map((value, index)=>{
                return <ProductItem key={value.id} data={value}></ProductItem>
            })}
    
            <NavigatePages navigateTo={`/products/category/${params.categoryId}/page/`} currentPageNo={params.pageNo || 1} totalPageNo={totalPageNo.current}></NavigatePages>
            </div>
            </>
        )
}