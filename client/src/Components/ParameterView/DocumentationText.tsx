import React, {useState} from "react";
import "./ParameterView.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import classNames from "classnames";

type DocumentationTextProps = {
    inputText: string
}

export default function DocumentationText({inputText = ""}: DocumentationTextProps): JSX.Element {

    const shortenedText = inputText.split("\n\n")[0];
    const hasMultipleLines = shortenedText !== inputText;

    const [readMore, setReadMore] = useState(false);

    const cssClasses = classNames(
        "read-more-button",
        {
            "pl-1-5rem": !hasMultipleLines,
        }
    );

    return (
        <div className="docu-paragraph" onClick={() => {
            setReadMore(!readMore);
        }}>
            {!readMore && hasMultipleLines && "▶"}
            {readMore && hasMultipleLines && "▼"}
            <ReactMarkdown className={cssClasses} remarkPlugins={[remarkGfm]}>
                {readMore ? inputText : shortenedText}
            </ReactMarkdown>
        </div>
    );
}
