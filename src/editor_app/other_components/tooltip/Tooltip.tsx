import { createPortal } from "react-dom";
import { useRef, useState } from "react";
import "./Tooltip.css";

export type TooltipProps = {
    text: string;
    textClass?: string;
    children: React.ReactNode;
};

export function Tooltip(props: TooltipProps) {
    const ref = useRef<HTMLSpanElement>(null);

    const [visible, setVisible] = useState(false);
    const [x, setX] = useState(0);
    const [y, setY] = useState(0);

    function onMouseEnter() {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();

        setX(rect.left + rect.width / 2);
        setY(rect.top);

        setVisible(true);
    }

    function onMouseLeave() {
        setVisible(false);
    }

    return (
        <div className="Tooltip">
            <span ref={ref} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
                {props.children}
            </span>

            {createPortal(
                <div
                    className={`TooltipText ${props.textClass? props.textClass : ""} ${visible ? "TooltipTextVisible" : ""}`}
                    style={{ left: x, top: y }}
                >
                    {props.text}
                </div>,
                document.body
            )}
        </div>
        
    );
}