import { useState } from "react";
import { downloadArrow } from "../assets";

const History = ({
    currImg,
    imgList,
    onClick
}) => {
    const [currIndex, setCurrIndex] = useState(0);
    const selectedHistory = (fullUrl, index) => {
        return fullUrl === currImg  && currIndex == index ? "bg-slate-700/80" : "bg-slate-700/20"
    }

    const downloadImage = (url) => {
        // Convert Base64 to Blob
        const byteString = atob(url.split(',')[1]);
        const mimeString = url.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mimeString });

        // Create a temporary anchor element and trigger the download
        const href = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = href;
        link.download = 'tshirt-background.jpg';
        document.body.appendChild(link);
        link.click();

        // Clean up
        document.body.removeChild(link);
        URL.revokeObjectURL(href);
    };

    return ( 
        <div className="h-full flex flex-col p-3 rounded-md z-50 border glassmorphism overflow-y-auto ">
            <div className="pb-2">
                <p className="text-md font-extrabold text-slate-700">History</p>
            </div>
            
            {imgList.length != 0 ? imgList.map((img, index) => (
                <div key={`${img.full.url}_${img.logo.url}`} 
                    className={`flex justify-between rounded-md w-full border border-slate-500 p-1 mb-2  ${selectedHistory(img.full.url, index)} transition`}
                >
                    <div 
                        className="flex mr-3 cursor-pointer"
                        onClick={()=> {
                            setCurrIndex(index)
                            onClick(img)
                        }}    
                    >
                        <img 
                            key={`${img.full.url}_${img.logo.url}_img`}
                            className="flex h-7 h-7 border rounded-md "
                            src={img.full.url}
                        />
                        <p key={`${img.full.url}_${img.logo.url}_prompt`} className="text-xs text-white truncate ml-2 pt-1">{img.prompt}</p>
                    </div>
                    <button
                        onClick={()=> downloadImage(img.full.url)}
                        className=" border-slate-500 h-4 w-4 pt-1 mr-1 cursor-pointer"
                    >
                        <img 
                            src={downloadArrow}        
                        />
                    </button>
                </div>
            )):
            <div className="flex h-full justify-center align-middle pt-[50%] text-slate-700 italic">
                <p className="text-xs">There is no history</p>
            </div>
            }
        </div>
     );
}
 
export default History;