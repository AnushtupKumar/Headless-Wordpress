
import { createPortal } from "react-dom"

export default function ErrorHandler({children, reset}){
    return createPortal(<>
    <div className="error-message">
        {children}
        <button onClick={reset}>Retry</button>
    </div>
    </>, document.getElementById("modal-root"))
}