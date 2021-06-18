import React, {useState} from "react";
import "./ParameterView.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import classNames from "classnames";

// @ts-ignore
const DocumentationText = ({inputText}) => {

    const shortenedText = inputText.split("\n")[0];
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
            setReadMore(!readMore)
        }}>
            {!readMore && hasMultipleLines && "▶"}
            {readMore && hasMultipleLines && "▼"}
            <ReactMarkdown className={cssClasses} children={readMore ? inputText : shortenedText}
                           remarkPlugins={[remarkGfm]}/>

        </div>
    );
};

export default DocumentationText;