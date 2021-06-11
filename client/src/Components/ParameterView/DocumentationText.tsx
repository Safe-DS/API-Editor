import React, {useState} from "react";
import "./ParameterView.css";

// @ts-ignore
const DocumentationText = ({inputText}) => {

    const [readMore,setReadMore] = useState(false);
    const moreTextOption = inputText.length > 50

    let endPosition = 50;
    const text = inputText.substr(0, endPosition);

    if(moreTextOption) {
        for(let i = 50; text.charAt(i) !== " " && i > 0; i--){
            endPosition = i;
        }
    }


    const linkName = readMore ? '[Read less]' : '...'
    //▼ ▶
    return (
        <div>
            <p onClick={()=>{setReadMore(!readMore)}}>
                {moreTextOption && !readMore && "▶"}
                {moreTextOption && readMore && "▼"}
                <button className="read-more-button">
                    {!readMore && inputText.substr(0, endPosition)}
                    {readMore && inputText}
                    {moreTextOption && linkName}
                </button>
            </p>

        </div>
    );
};

export default DocumentationText;