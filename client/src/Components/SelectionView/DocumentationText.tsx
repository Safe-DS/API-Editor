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

    const preprocessedText = inputText
        .replaceAll(/(?<!\n)\n(?!\n)/g, " ")
        .replaceAll(/:math:`([^`]*)`/g, "$$$1$$")
        .replaceAll(/\.\. math::\s*(\S.*)\n\n/g, "$$$\n$1\n$$$\n\n");

    const shortenedText = preprocessedText.split("\n\n")[0];
    const hasMultipleLines = shortenedText !== inputText;
    const [readMore, setReadMore] = useState(false);

    const cssClasses = classNames(
        "read-more-button",
        {
            "pl-1rem": !hasMultipleLines,
            "pointer-cursor": hasMultipleLines && !readMore
        },
    );

    return (
        <div className="docu-paragraph"
             onClick={() => {
                 setReadMore(true);
             }}>
            {hasMultipleLines &&
            <div className="pointer-cursor"
                 onClick={(event) => {
                     event.stopPropagation();
                     setReadMore(!readMore);
                 }}>
                <VisibilityIndicator hasChildren={hasMultipleLines} showChildren={readMore}/>
            </div>
            }
            <ReactMarkdown className={cssClasses} rehypePlugins={[rehypeKatex]} remarkPlugins={[remarkGfm, remarkMath]}>
                {readMore || !hasMultipleLines ? preprocessedText : shortenedText + " [Read More...]"}
            </ReactMarkdown>
        </div>
    );
}
