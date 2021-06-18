import React, {useState} from "react";
import "./ParameterView.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// @ts-ignore
const DocumentationText = ({inputText}) => {

    const shortenedText = inputText.split("\n")[0];

    const [readMore, setReadMore] = useState(false);

    return (
        <div className="docu-paragraph" onClick={() => {
            setReadMore(!readMore)
        }}>
            {!readMore && "▶"}
            {readMore && "▼"}
            <ReactMarkdown className="read-more-button" children={readMore ? inputText : shortenedText}
                           remarkPlugins={[remarkGfm]}/>

        </div>
    );
};

export default DocumentationText;