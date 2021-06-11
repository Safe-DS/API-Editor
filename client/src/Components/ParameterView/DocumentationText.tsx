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

    return (
        <div>
            <p>{!readMore && inputText.substr(0, endPosition)}
                {readMore && inputText}
                <button className="read-more-button" onClick={()=>{setReadMore(!readMore)}}>
                    {moreTextOption && linkName}
                </button>
            </p>

        </div>
    );
};

export default DocumentationText;