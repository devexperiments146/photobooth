import React, {  useEffect, useRef } from "react";
import Webcam from "react-webcam";
import axios  from 'axios';
import { useNavigate, useSearchParams } from "react-router";
import QRCode from "react-qr-code";

const videoConstraints = {
  width: 540,
  facingMode: "environment"
};

const Camera: React.FC = () => {
  const webcamRef = useRef<any>(null);
  const [url1, setUrl1] = React.useState(null);
  const [url2, setUrl2] = React.useState(null);
  const [timeLeft, setTimeLeft] = React.useState<number>(0);
  const [step, setStep] = React.useState(0);
  const [urlResult, setUrlResult] = React.useState(null);
  const [text, setText] = React.useState(null);
  const [cameraReady, setCameraReady] = React.useState(false);

  //0 => Webcam
  //1 => Compteur
  //2 => Webcam 
  //3 => Compteur
  //4 => Webcam
  //5 => Compteur
  //6 => Ecran de chargement
  //7 => Photo globale + QRCode

  const [searchParams] = useSearchParams();
  const token = searchParams.get("auth_token") ?? "";

  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      localStorage.setItem("auth_token", token);
    }
  }, [token]);

const onKeyDown = React.useCallback(async () => {
  // on ne bloque que la première prise si la caméra n’est pas encore prête
  if (step === 0 && cameraReady){
    setStep(1);
    setTimeLeft(3);
  } else if (step === 2) {// reset pour forcer la réinit caméra
    setStep(3);
    setTimeLeft(3);
  } else if (step === 4) {
    setStep(5);
    setTimeLeft(3);
  } else if (step === 7) {
    setCameraReady(false);
    setStep(0);
  }
}, [step, cameraReady]);


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
      } else if (step === 3) {
        setUrl2(imageSrc);
        setStep(4);
      } else if (step === 5) {
        if (url1 && url2) {
          try{
            const token = localStorage.getItem("auth_token");
            const axiosConfig = {
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
              },
            };
            setStep(6);
            const response = await axios.post(
              "http://localhost:4000/images",
              { url1, url2, url3: imageSrc },
              axiosConfig
            );

            if (response.data) {
              setUrlResult(response.data.image);
              setText(response.data.url);
              setStep(7);
            }else{
              localStorage.removeItem("auth_token");
              navigate("/"); 
            }
          } catch (error) {
            console.error("Erreur lors de l'appel HTTP :", error);
            localStorage.removeItem("auth_token");
            navigate("/"); 
          }
        }
      }
    };
    if (timeLeft === 0) {
      takePicture();
    }
  }, [timeLeft, step, url1, url2,navigate]);

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onKeyDown]);



  const onUserMedia = React.useCallback(() => {
    console.log("Caméra prête !");
    setCameraReady(true);
  }, []);

  return (
      <div className="camera-container relative bg-black w-full h-screen flex items-center justify-center overflow-hidden">
       {step === 0 && !cameraReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white z-10">
            <div className="w-16 h-16 border-8 border-white/30 border-t-white rounded-full animate-spin mb-8"></div>
            <div className="text-4xl font-bold tracking-wide">
              Initialisation de la caméra...
            </div>
          </div>
        )}
        {(step <= 5) && (
          <><Webcam
              ref={webcamRef}
              audio={true}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              onUserMedia={onUserMedia}
              className="w-full h-full object-contain bg-black z-0"
            />
          {((step === 0 && cameraReady) || step === 2 || step === 4) && (
            <div className="absolute bottom-6 left-0 right-0 flex justify-center">
              <div className="bg-black/60 text-white text-2xl font-semibold px-6 py-3 rounded-xl">
                Appuyez sur le bouton pour prendre la photo ({step===0?1:(step===2?2:3)}/3) !
              </div>
            </div>
          )}
          </>
        )}
        
        {(step === 1 || step === 3 || step === 5) && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black/60 text-white text-[8rem] font-bold px-8 py-4 rounded-2xl">
              {timeLeft}
            </div>
          </div>
        )}
      {step === 6 && 
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white">
          <div className="w-16 h-16 border-8 border-white/30 border-t-white rounded-full animate-spin mb-8"></div>
          <div className="text-4xl font-bold tracking-wide">
            Création de la photo...
          </div>
        </div>
      }
      {step === 7 && urlResult && text && (
        <div className="flex flex-col w-full min-h-screen bg-white p-8 space-y-8">

  {/* Ligne 1 : Image centrée, hauteur limitée */}
  <div className="flex justify-center items-center w-full">
    <img
      src={urlResult}
      alt="Screenshot"
      className="max-h-[60vh] max-w-full object-contain rounded-2xl shadow-lg"
    />
  </div>

  {/* Ligne 2 : QR code + texte côte à côte */}
  <div className="flex flex-col md:flex-row items-center justify-center w-full md:space-x-8 space-y-6 md:space-y-0">
    <QRCode value={text} size={200} />
    <div className="text-gray-800 text-xl font-semibold text-center md:text-left max-w-md">
      Scannez le QR code pour récupérer votre photo<br />
      et appuyez sur une touche pour revenir au point de départ.
    </div>
  </div>

</div>

      )}
      </div>
  );
};

export default Camera;