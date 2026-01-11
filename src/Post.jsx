import React, { useEffect, useState, useContext } from "react";
import { RouteContext } from "./Router";
import Loading from "./components/Loading";
import { getPOST } from "./fetch-helper";
import './assets/css/post.css'


export default function PostPage(){
    const {params} = useContext(RouteContext);
    const [isLoading , setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [data, setData] = useState([]);

    const slug = params.slug;

    const loadPost = async ()=>{
        try{
            await getPOST({slug:slug}).then(res => {
                setData(res.data);
            })
        }catch(err){
            setHasError(true);
        }finally{
            setIsLoading(false);
        }
    }
    useEffect(()=>{
       loadPost();
    },[params.slug]);

    if(isLoading) return <Loading/>

    return (
        <Post data={data}></Post>
    )
} 

export function Post({data}){ 

    return (
        <>
        <div className={`poppins-regular post post-${data.id}`}>
            <h1 className='title' >{data.title}</h1>
          <picture className="feature-img">
                <source media='min-width: 990px' src={data.feature_img} type="image/" />
                <img src={data.feature_img} alt='dummy' />
            </picture> 
            <div className="content" dangerouslySetInnerHTML={{__html:data.content}}></div>
        </div>
        </>
    )
}
