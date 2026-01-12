import React, { useState, useContext, useMemo } from "react";
import { RouteContext } from "./Router";
import { getComments, getPOST } from "./fetch-helper";
import './assets/css/post.css'
import { LazyLoad } from "./App";


export default function PostPage(){
    const {params} = useContext(RouteContext);
    const slug = params.slug;

   const promise = useMemo(()=>getPOST({slug:slug}),[slug]);

    return (
        <LazyLoad promise={promise}>
            {({data})=><Post data={data}/>}
        </LazyLoad>
    )
} 

export function Post({data}){ 
    const promise = useMemo(()=>getComments(data.id));
     
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
        <LazyLoad promise={promise}>
            {({data})=><Comments data={data}/>}
        </LazyLoad>
        </>
    )
}

function Comments({data}){
     return (
        <div className="comments">
            {data.length > 0 ? data.map(comment=>{
                return <div key={comment.id} className="comment">
                    <div className="avatar">
                        <img width="60px" height="60px" src={comment.commentor_avatar_urls["48"]}/>
                    </div>
                    <div className="com">
                        <div className="info">
                            <div className="commentor">{comment.author}</div>
                            <div className="data-created">{comment.date_created}</div>
                        </div>
                        <div className="comment-text" dangerouslySetInnerHTML={{__html:comment.content}}></div>
                    </div>
                </div>
            }) : "No comment yet. Be first to Share your thoughts!"}
        </div>
    )
}
