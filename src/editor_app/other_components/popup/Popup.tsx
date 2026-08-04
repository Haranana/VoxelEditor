import { useEffect, useRef, type RefObject } from "react";

export type PopupProps = {
    children: React.ReactNode
    onClose: ()=>void
    ignordedNode?: React.RefObject<Node | null> //element that doesn't cause popup to close, e.g. button that opens it
}

export default function Popup(props: PopupProps) {

    const popupRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClick(event: MouseEvent) {
            if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
                if(!props.ignordedNode || !props.ignordedNode.current || !props.ignordedNode.current.contains(event.target as Node)){
                    props.onClose();
                }
            }
        }

        document.addEventListener("mousedown", handleClick);
        return () => {
            document.removeEventListener("mousedown", handleClick);
        };

    }, []);

    return (
        <div ref={popupRef}>
            {props.children}
        </div>
    );
}