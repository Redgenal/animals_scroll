import './MobileApp.css';
import './WebApp.css'
import { useState, useMemo, useEffect } from 'react';
import { typography } from '@salutejs/plasma-tokens';
import { IconChevronLeft } from '@salutejs/plasma-icons';
import { createAssistantDev, AssistantAppState, createSmartappDebugger } from '@salutejs/client';
import { AppWrapper } from './webComponents/globalWrapper/globalWrapper';
import { SvgLeftArrow } from './webComponents/svg/leftArrowSvg/leftArrowSvg';
import { SvgRightArrow } from './webComponents/svg/rightArrowSvg/rightArrowSvg';
import { ExitArrowSvg } from './webComponents/svg/exitArrowSvg/exitArrowSvg';

import {isMobile} from 'react-device-detect';



import {
  AlertItem, ModalDebug, add_evg_func,
  revert_to_old_debug,
  get_evg_func, show_alert,
  Junk, showPopUp, hidePopUp
} from "./mobileComponents/PopUp/Utils.jsx";
import { PopUp } from './mobileComponents/PopUp/PopUp.jsx';

const initialize = (getState) => {
  if (process.env.NODE_ENV === "development") {
    //откл перед билдом
    return createSmartappDebugger({
      token: process.env.REACT_APP_TOKEN,
      //CHANGE START PHRASE
      initPhrase: 'запусти furryAntidepressant121',
      getState,
      enableRecord: true,
      recordParams: {
        defaultActive: true,
      }
    });
  }
  return createAssistantDev({ getState });
}


function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}



function App() {
  // --          DEBUG MODE controls and hooks              --
  const [currObject, setCurrObejct] = useState([]);
  const [mode, setMode] = useState("normal");
  const [totObject, setTotObject] = useState([]);
  const [alertItem, setAlertItem] = useState([]);
  const [popUpObject, setPopUpObject] = useState([]);
  const [list, setList] = useState([]);
    const [curr, setCurr] = useState(null);
    const [frontLink, setFrontLink] = useState('');

  function sendAE(act, stf = {}) {
    window.evg_assistant.sendData({ action: { action_id: act, parameters: stf } });
  }

  function closeApp() {
    sendAE("FINAL", {});
    window.evg_assistant.close();
  }

  useEffect(() => {
    window.add_evg_func = add_evg_func;
    window.get_evg_func = get_evg_func;
    window.add_evg_func("sendAE", sendAE);
    window.add_evg_func("closeApp", closeApp);
    window.add_evg_func("showAlert", show_alert);
    window.add_evg_func("showPopUp", showPopUp);
    window.add_evg_func("hidePopUp", hidePopUp);
    window.evg_assistant = initialize(() => window.evg_assistant_state);
  }, []);

  
  useEffect(() => {
    window.evg_assistant.on("data", (input) => {
      console.log('assistant', input);
      if (input.smart_app_data) {
        setCurrObejct(input.smart_app_data);
      }
    });
  }, []);


  useEffect(() => {
    let t = new Array;
    Object.assign(t, totObject);
    let t1 = new Object;
    Object.assign(t1, currObject);
    t.push(t1);
    setTotObject(t);

    //поступление с мидла строки и действие с окном
    const complex_func_arr = [
      {
        name: "closeApp",
        func: () => {
          window.get_evg_func("sendAE")("CLOSE_APP");
          window.get_evg_func("closeApp")();
        }
      },
      {
        name: "showAlert",
        func: () => {
          setAlertItem({
            upperText: currObject.commandParams.upperText || "",
            lowerText: currObject.commandParams.lowerText || ""
          });
          window.get_evg_func("showAlert")();
        }
      },
      {
        name: "showPopUp",
        func: () => {
          setPopUpObject(currObject.commandParams);
          window.get_evg_func("showPopUp")("popUp", "mainThing", null);
        }
      },
      {
        name: "hidePopUp",
        func: () => {
          window.get_evg_func("hidePopUp")("popUp", "mainThing");}
      },
      
    ];
    console.log('test_0', complex_func_arr);
    let complex_func = complex_func_arr.find(
      (i) => (i.name === currObject.commandName))
    console.log('test_01', currObject.commandName);
    if (complex_func !== undefined) {
      complex_func.func();
    }
  }, [currObject]);
 
  let index = 0;

//подача строки с миддла -сценария на фронт и действие
  // const [curr, setCurr] = useState({});

  useEffect(()=>{
    
    if (currObject?.commandName?.list) {
          setList(shuffle(currObject.commandName.list));
    }

    if (currObject?.commandName?.slide === 'nextSlide'){
      console.log("RRRRRRRRRRRRRRRRRRRRRRRRRRR");
      goToNext();
    }
    
    if (currObject?.commandName?.slide === 'prevSlide'){
      console.log("BBBBBBBBBBBBBBBBBB")
      goToPrev();
    }
    //назад
    if (currObject?.commandName === 'shutDownCanvas'){
      console.log("OOOOOOOOOOOOOOOOOOOOOOOOOOOOOO");
      //this function will not close completely
      window.get_evg_func("sendAE")("CLOSE_APP");
      //this function closes completely
       window.get_evg_func("closeApp")();
     }
    console.log('test_1', currObject.commandName);
    if (currObject?.commandName?.showLink) {
        setFrontLink(currObject.commandName.showLink);
    }
  
 
}, [currObject])

const [idx, setIdx] = useState(0);
const goToPrev = (e) => {
    //e.preventDefault();
    const isFirstSlide = idx === 0;
    const newIdx = isFirstSlide ? list.length -1 : idx - 1;
    console.log('New idex =' + newIdx);
    setIdx(newIdx);
} 
 
const goToNext =() =>{
   const isLastSlide = idx === list.length - 1;
   const newIdx = isLastSlide ? 0 : idx + 1;
   setIdx(newIdx);
 }

 const goToSlide =(slideIdx) =>{
  setIdx(slideIdx)
 }


const [touchPosition, setTouchPosition] = useState(null)

const handleTouchStart = (e) => {
    const touchDown = e.touches[0].clientX
    setTouchPosition(touchDown)
}

const handleTouchMove = (e) => {
  const touchDown = touchPosition

  if(touchDown === null) {
      return
  }

  const currentTouch = e.touches[0].clientX
  const diff = touchDown - currentTouch
  
  if (diff > 5) {
      goToNext()
      console.log("mobile sliding right");
  }

  if (diff < -5) {
      goToPrev()
      console.log("mobile sliding left");
  }

  setTouchPosition(null)
}





  //DEV Return Component for render
  if(isMobile){
        return (
          <div className="App" 
          >
          
              <img className='image-gallery-slides' src = {list[idx]} alt="" 
              onTouchStart={handleTouchStart} 
              onTouchMove = {handleTouchMove}
              >
              </img>
          
            <div className='mobileDotsContainer'>
              {list.map( (_slide, slideIdx) =>(    
                <div key={slideIdx}
                  
                  className={idx === slideIdx ? "mobileDot1"  : "mobileDot2" }
                  onClick={()=>goToSlide(slideIdx)}
                >
                
                </div>
              ) )}
            </div>

            <div style={{ position: "fixed", left: "1rem", top: "1rem", display: "flex" }}>
              
              <div style={{ marginRight: "10px", zIndex: "1" }} id="goBack" onClick={
                () => {
                  window.get_evg_func("sendAE")("CLOSE_APP");
                  window.get_evg_func("closeApp")();
                }
              }>
                <IconChevronLeft size="s" color="white" />
              </div>

              <div className="headerText" style={typography.headline4}>
                Милые животные
                    </div>
                    

            </div>

            <AlertItem upperText={alertItem.upperText || ""} lowerText={alertItem.lowerText || ""} />

            <PopUp data={popUpObject} />

          </div>

        );
      }

  return (
    <AppWrapper>

      <div className='flexbox-container' >

        <div className='exitArrow' id="goBack" onClick={
                () => {
                  window.get_evg_func("sendAE")("CLOSE_APP");
                  window.get_evg_func("closeApp")();
                } 
        }>
          <ExitArrowSvg/>
        </div>
        
        <div className='flexbox-item-1'>
          <SvgLeftArrow onClick={goToPrev}  />
        </div>

        <div>
          
          <h1 className='h1style' style={{ color: 'white' }}>Милые животные</h1>
          <span className="development" color="white">{frontLink}</span>

          <div className='flexbox-item-2' >
            <img src={list[idx]} alt="" height={550} width={450} />
          </div>

          <div className='webDotsContainer'>
              {list.map( (_slide, slideIdx) =>(    
                  <div key={slideIdx} 
                    className={idx === slideIdx ? "webDot1" : "webDot2" }
                    onClick={()=>goToSlide(slideIdx)}>
      
                  </div>
              ) )}
            </div>
        </div>

        <div className=' flexbox-item-1'>
          <SvgRightArrow onClick={goToNext}  />
        </div>

      </div>
    </AppWrapper>
  );

}
export default App;