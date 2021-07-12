import classNames from "classnames";
import React, {useState} from "react";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import VisibilityIndicator from "../Util/VisibilityIndicator";
import "./SelectionView.css";
import "katex/dist/katex.min.css";

interface DocumentationTextProps {
    inputText: string
}

export default function DocumentationText({inputText = ""}: DocumentationTextProps): JSX.Element {

    const preprocessedText = inputText.replaceAll(/:math:`([^`]*)`/g, "$$$1$$");
    const shortenedText = preprocessedText.split("\n\n")[0];
    const hasMultipleLines = shortenedText !== inputText;

    const [readMore, setReadMore] = useState(false);

    const cssClasses = classNames(
        "read-more-button",
        {
            "pl-2rem": !hasMultipleLines,
        }
    );

    const iconCssClasses = classNames({
        "pl-1rem": hasMultipleLines,
    });

    return (
        <div className="docu-paragraph" onClick={() => {
            setReadMore(!readMore);
        }}>
            {hasMultipleLines && <div className={iconCssClasses}>
                <VisibilityIndicator hasChildren={hasMultipleLines} showChildren={readMore}/>
            </div>}


            <ReactMarkdown className={cssClasses} rehypePlugins={[rehypeKatex]} remarkPlugins={[remarkGfm, remarkMath]}>
                {readMore ? preprocessedText : shortenedText}
            </ReactMarkdown>
        </div>
    );
}
