import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from '../Router.jsx';

async function getMenu() {
    const data = await fetch("/public/mockMenu.json").then(v => v.json());
    return data;
}
export default function Header() {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const ref = useRef();

    useEffect(() => {
        getMenu().then((data) => {
            setData(data.items);
            setIsLoading(false);
        })
    }, [])

    const handleClick = (e)=>{
        ref.current.classList.toggle("show")
    }
    return (
        <>
            <header className="header">
                <button onClick={handleClick} className="menu-toggle">Menu</button>
                <nav ref={ref} className="navbar">
                    <button onClick={handleClick} className="menu-toggle">x</button>
                    <ul className="menu">
                        <Menu data={data} />
                    </ul>
                </nav>
            </header>
        </>
    )
}

function Menu({ data }) {

    return <>
        {data.map((d, index) => {
            if (!d.children || d.children.length == 0) return <MenuItem key={d.ID} href={d.url} title={d.title}></MenuItem>;
            return <SubMenu key={d.ID} data={d} />

        })}</>
}

function SubMenu({ data }) {
    const ref = useRef();
    const handleClick = (e) => {
        ref.current.classList.toggle("show");
    }

    return (<>
        <MenuItem key={data.ID} href={data.url} title={data.title}>
        <button className="toggle-submenu" onClick={handleClick}>&gt;</button>
       <ul ref={ref} className="sub-menu">
            <Menu data={data.children} />
        </ul>
        </MenuItem>
    </>
    )

}

function MenuItem({title, href, children, ...rest }) {



    return (
        <li className="menu-item" {...rest}>{<Link href={href || "#"}>{title}</Link>}{children}</li>
    )
}