import React, {  useEffect, useRef } from "react";
import Webcam from "react-webcam";
import axios  from 'axios';
import { useSearchParams } from "react-router";
import QRCode from "react-qr-code";

import './Camera.css';

const videoConstraints = {
  width: 540,
  facingMode: "environment"
};

const Camera: React.FC = () => {
  const webcamRef = useRef<any>(null);
  const [url1, setUrl1] = React.useState(null);
  const [url2, setUrl2] = React.useState(null);
  const [url3, setUrl3] = React.useState(null);
  const [timeLeft, setTimeLeft] = React.useState<number>(0);
  const [step, setStep] = React.useState(0);
  let [searchParams, setSearchParams] = useSearchParams();
  const [urlResult, setUrlResult] = React.useState(null);
  const [text, setText] = React.useState(null);
  //0 => Webcam
  //1 => Compteur
  //2 => url1 
  //3 => Compteur
  //4 => url2
  //5 => Compteur
  //6 => Photo globale + QRCode


  const onKeyDown = React.useCallback(async () => {
    if(step == 0){
      setStep(1);
      setTimeLeft(3);
    }else if(step== 2){
      setStep(3);
      setTimeLeft(3);
    }else if(step== 4){
      setStep(5);
      setTimeLeft(3);
    }else if(step== 6){
      setStep(0);
    }
  }, [ url1, url2, url3]);


  useEffect(() => {
    if (timeLeft <= 0) return;

    const intervalId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft]);
  
  useEffect(() => {
    const takePicture = async () => {
      if (!webcamRef.current) return;
      const imageSrc = webcamRef.current.getScreenshot();
      if (step === 1) {
        setUrl1(imageSrc);
        setStep(2);
        setTimeLeft(5); // relance timer si besoin
      } else if (step === 3) {
        setUrl2(imageSrc);
        setStep(4);
        setTimeLeft(5);
      } else if (step === 5) {
        if (url1 && url2) {
          const token = searchParams.get('auth_token') ?? "";
          const axiosConfig = {
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + token,
            },
          };
          const response = await axios.post(
            "http://localhost:4000/images",
            { url1, url2, url3: imageSrc },
            axiosConfig
          );

          if (response.data) {
            setUrlResult(response.data.image);
            setText(response.data.url);
            setStep(6);
          }
        }
      }
    };

    if (timeLeft === 0) {
      takePicture();
    }
  }, [timeLeft, step, url1, url2]);

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onKeyDown]);


  const onUserMedia = (e: any) => {
    console.log(e);
  };

  return (
    <>
      {(step == 1 || step == 3 || step == 5 ) && 
        <div className="wrapper"><div className="timeleft">{timeLeft}</div></div> 
      }
      {(step == 0 || step == 1 || step == 3 || step == 5 )  && <Webcam
        ref={webcamRef}
        audio={true}
        screenshotFormat="image/jpeg"
        videoConstraints={videoConstraints}
        onUserMedia={onUserMedia}
      />}
       {step == 2 &&  url1 &&
        <div className="wrapper">
          <img src={url1} alt="Screenshot" />
        </div> 
      }
      {step == 4 &&  url2 &&
        <div className="wrapper">
          <img src={url2} alt="Screenshot" />
        </div> 
      }
      {step == 6 && urlResult && text && (
        <div className="wrapper">
          <img src={urlResult} alt="Screenshot" />
          <div className="box">
            <QRCode value={text} size={200} />
          </div>
        </div>
      )}
    </>
  );
};

export default Camera;