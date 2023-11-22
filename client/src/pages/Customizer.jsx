import React, {useState} from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useSnapshot } from 'valtio'

import config from '../config/config'
import state from '../store'
import { download } from '../assets'
import { downloadCanvasToImage, reader } from '../config/helpers'
import { EditorTabs, FilterTabs, DecalTypes } from '../config/constants'
import { fadeAnimation, slideAnimation } from '../config/motion'
import { AIPicker, ColorPicker, CustomButton, FilePicker, Tab } from '../components'
import History from '../components/History'

function Customizer() {
    const snap = useSnapshot(state)
    const [file, setFile] = useState("")
    const [prompt, setPrompt] = useState("")
    const [generatingImg, setGeneratingImg] = useState(false)
    const [activeEditorTab, setActiveEditorTab] = useState("");
    const [activeFilterTab, setActiveFilterTab] = useState({
        logoShirt: true,
        stylishShirt: false,
    });
    const [imgHistory, setImgHistory] = useState([]);
    const [currImage, setCurrImage] = useState("");
    const [currLogo, setCurrLogo] = useState("");
    // show tab content depending on the active tab
    const generateTabContent = () => {
        switch(activeEditorTab) {
            case "colorpicker":
                return <ColorPicker />
            case "filepicker":
                return <FilePicker 
                    file={file}
                    setFile={setFile}
                    readFile = {readFile}
                />
            case "aipicker":
                return <AIPicker
                    prompt={prompt}
                    setPrompt={setPrompt}
                    generatingImg={generatingImg}
                    handleSubmit={handleSubmit}
                />
            default:
                return null;
        }
    }

    const handleSubmit = async (type) => {
        if(!prompt) return alert("Please enter a prompt")
        try{
            setGeneratingImg(true)
            console.log(`prompt: ${JSON.stringify({prompt: prompt,})}`)
            const response = await fetch('https://custom-shirt-threejs-ai.onrender.com/api/v1/dalle', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt,
                })
            })


            const data = await response.json()
            const imgUrl = `data:image/png;base64,${data.photo}` 
            console.log("type is ", type)
            const fullImage = type === "full" ? imgUrl : currImage
            const logoImage = type === "logo" ? imgUrl : currLogo
            setCurrImage(fullImage)
            setCurrLogo(logoImage)
            const alreadyInHistory = imgHistory.some(img => img.full.url === fullImage)
            if(!alreadyInHistory){
                setImgHistory((history)=> [{
                    full: {
                        url: fullImage
                    },
                    logo: {
                        url: logoImage
                    },
                    prompt
                }, ...history])
            }
            handleDecals(type, imgUrl)
        }catch(error){
            alert(error)
        }finally{
            setGeneratingImg(false)
            setActiveEditorTab("")
        }
    }

    const handleHistoryOnClick = ({full, logo, prompt}) => {
        setPrompt(prompt)
        setCurrImage(full.url)
        setCurrLogo(logo.url)
        handleDecals("full", full.url)
    }

    const handleDecals = (type, result) => {
        const decalType = DecalTypes[type]
        state[decalType.stateProperty] = result
        if(!activeFilterTab[decalType.filterTab]) {
            handleActiveFilterTab(decalType.filterTab)
        }
    }

    const handleActiveFilterTab = (tabName) => {
        switch(tabName){
            case "logoShirt":
                state.isLogoTexture = !activeFilterTab[tabName]
                break;
            case "stylishShirt":
                state.isFullTexture = !activeFilterTab[tabName]
                break;
            default:
                state.isFullTexture = false
                state.isLogoTexture = true
        }
        // after setting the state set active tab
        setActiveFilterTab((prevState) => {
            return {
                ...prevState,
                [tabName]: !prevState[tabName]
            }
        })
    }

    const readFile = (type) => {
        reader(file)
        .then((result) => {
            handleDecals(type, result)
            setActiveEditorTab("")
        })
    }
  return (
    <AnimatePresence>
        {!snap.intro && (
            <>
                <motion.div
                    key="custom"
                    className="absolute top-0 left-0 z-10"
                    {...slideAnimation('left', 400)}
                >
                    <div className='flex items-center min-h-screen'>
                        <div className='editortabs-container tabs'>
                            {EditorTabs.map((tab) => (
                                <Tab 
                                    key={tab.name}
                                    tab={tab}
                                    handleClick={() => setActiveEditorTab(tab.name)}
                                />
                            ))}
                            {generateTabContent()}
                        </div>
                    </div>

                </motion.div>
                <motion.div
                    className='absolute z-10 top-5 right-5'
                    {...fadeAnimation}
                >
                    <CustomButton 
                        type="filled"
                        title="Go Back"
                        handleClick={() => state.intro = true}
                        customStyles="w-fit px-4 py-2.5 font-bold text-sm"
                    />
                </motion.div>
                <motion.div
                    className='filtertabs-container'

                    {...slideAnimation('up')}
                >
                     {FilterTabs.map((tab) => (
                        <Tab 
                            key={tab.name}
                            tab={tab}
                            isFilterTab
                            isActiveTab={activeFilterTab[tab.name]}
                            handleClick={() => handleActiveFilterTab(tab.name)}
                        />
                    ))}

                </motion.div>
                <motion.div
                    className='absolute top-[200px] right-5 w-[250px] h-[600px] hidden md:block'

                    {...slideAnimation('right', 300)}
                >
                     <History 
                        currImg={currImage}
                        imgList={imgHistory}
                        onClick={handleHistoryOnClick}
                     />
                </motion.div>
            </>
        )}
    </AnimatePresence>
  )
}

export default Customizer