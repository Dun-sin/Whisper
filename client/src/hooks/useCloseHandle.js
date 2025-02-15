

import { useEffect } from "react"

export const useCloseAndReloadHandle=(condition=true)=>{
    useEffect(()=>{
        const closeWindowHandler=(event)=>{
            if (condition) {
                event.preventDefault();
                event.returnValue='';
                
            }

        }

        window.addEventListener('beforeunload',closeWindowHandler);

        return ()=>{
            window.removeEventListener('beforeunload',closeWindowHandler)
        }

    },[condition])
}