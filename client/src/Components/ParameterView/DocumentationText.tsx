import React, {useState} from "react";
import "./ParameterView.css";

// @ts-ignore
const DocumentationText = ({inputText}) => {

    const [readMore,setReadMore] = useState(false);
    const moreTextOption = inputText.length > 50

    const linkName = readMore ? '[Read less]' : '[Read more]'

    return (
        <div>
            <p>{!readMore && inputText.substr(0, 50)}
                {readMore && inputText}
                <button className="read-more-button" onClick={()=>{setReadMore(!readMore)}}>
                    {moreTextOption && linkName}
                </button>
            </p>

        </div>
    );
};

export default DocumentationText;