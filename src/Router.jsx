import React, { useContext, useEffect, useRef, useState } from "react";


const RouterContext = React.createContext();

export function Router({ children }) {
    const [currentUrl, setCurrentUrl] = useState(location.pathname);

    function navigateTo(path) {
        if (path == currentUrl) return;
        history.pushState({}, "", location.origin + path);
        setCurrentUrl(path);
    }

    useEffect(() => {
        const updateLocation = (e) => {
            setCurrentUrl(location.pathname);
        }

        window.addEventListener("popstate", updateLocation);

        return () => window.removeEventListener("popstate", updateLocation);
    }, [])

    return (<RouterContext.Provider value={{ currentUrl, navigateTo }}>{children}</RouterContext.Provider>)
}

export const RouteContext = React.createContext();

export function Route({ path, children, __values }) {

    const { currentUrl } = useContext(RouterContext);

    const matchesInPath = [...path.matchAll(/\$\{(\w+)\}/g)];
    const pattern = path.replaceAll("/", "\\/").replaceAll(/\$\{\w+\}/g, "([^/]+)");
    const regexp = new RegExp(`^${pattern}$`);

    const pathOnly = currentUrl.split("?")[0].split("#")[0];
    const matchInCurrentUrl = pathOnly.match(regexp);

    let params = {};
    if (matchInCurrentUrl) {
        let s = [...matchInCurrentUrl];
        matchesInPath.forEach((value, index) => {
            params[value[1]] = s[index + 1];
        })

        return <RouteContext.Provider value={{ params: params, __values }}>
            {React.Children.map(children, child => React.isValidElement(child) ? React.cloneElement(child) : child)}
        </RouteContext.Provider>
    }

    return <></>
}

export function Link({ children, onClick, ...rest }) {
    const { navigateTo } = useContext(RouterContext);
    const handleClick = (e) => {
        e.preventDefault();
        if (onClick instanceof Function) onClick();
        navigateTo(e.currentTarget.getAttribute("href"));

    }
    return <a onClick={handleClick} {...rest}>{children}</a>
}