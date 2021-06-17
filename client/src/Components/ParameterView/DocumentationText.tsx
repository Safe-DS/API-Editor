import React, {useState} from "react";
import "./ParameterView.css";

// @ts-ignore
const DocumentationText = ({inputText}) => {

    const [readMore,setReadMore] = useState(false);
  /*  const moreTextOption = inputText.length > 50

    let endPosition = 50;
    const text = inputText.substr(0, endPosition);

    if(moreTextOption) {
        for(let i = 50; text.charAt(i) !== " " && i > 0; i--){
            endPosition = i;
        }
    }*/

    return (
        <div className="docuParagraph" onClick={()=>{setReadMore(!readMore)}}>
            {!readMore && "▶"}
            {readMore && "▼"}
            <div className="read-more-button">
                {
                    !readMore &&  <div className="docuTextHidden">{inputText}</div>
                }

                {readMore && inputText}
            </div>
        </div>
    );
};

export default DocumentationText;