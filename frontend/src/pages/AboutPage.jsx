import "../about.css";
import { motion } from "framer-motion";
import { useState, MouseEvent, useCallback } from "react";
import { Link } from "react-router";

// Helper function to throttle the mouse move events to improve performance
function throttle(func, delay) {
  let lastCall = 0;
  return (...args) => {
    const now = new Date().getTime();
    if (now - lastCall < delay) {
      return;
    }
    lastCall = now;
    return func(...args);
  };
}



const AboutPage = () => {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  // Throttled mouse move event handler to track mouse position
  const onMouseMove = useCallback(
    throttle((e) => {
      const img = e.currentTarget;
      const box = img.getBoundingClientRect();
      const x = e.clientX - box.left;
      const y = e.clientY - box.top;
      const centerX = box.width / 2;
      const centerY = box.height / 2;
      const rotateX = (y - centerY) / 7; // Rotate based on vertical position
      const rotateY = (centerX - x) / 7; // Rotate based on horizontal position

      setRotate({ x: rotateX, y: rotateY });
    }, 100),
    []
  );

  const onMouseLeave = () => {
    setRotate({ x: 0, y: 0 }); // Reset the tilt when mouse leaves
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="about-page">

      <div class="grid grid-cols-2 gap-4">
  
        <div class="left-smth flex flex-col mt-[40px] -ml-[40px] align-items items-center justify-center">
          <motion.div
            class=""
            initial={{ opacity: 0, scale: 0.95, x: 0 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{
              duration: 1,
            }}
            style={{ display: "inline-block" }}>
            <img
              src="/src/assets/Docurate_Logo.png"
              alt="Logo"
              onMouseMove={onMouseMove}
              onMouseLeave={onMouseLeave}
              style={{
                transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
                transition: "all 0.3s cubic-bezier(0.03, 0.98, 0.52, 0.99)", // Smooth transition
              }}
            />
          </motion.div>

          <h1 className="white-text text-6xl -mt-[20px] font-bold">DOCURATE</h1>
          <h1 className="subtitle text-2xl ">Your Document Management Solution</h1>
          <Link to="/" className="text-lg back-button mt-10">
            Back to Login
          </Link>
        </div>

        <div>
            <motion.div className="header mt-[100px] text-lg font-bold flex justify-between"
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 1,
              }}>

                <div className="flex flex-col gap-y-1">
                  <p>A Thesis Project Submitted to the Faculty of ____ </p>
                  <p>Bachelor of Computer Science blah</p>
                  <p>Bataan Peninsula State University</p>
                </div>
              
                <div>
                  <div className="flex gap-x-3 mr-[10px]">
                    <img src="bpsu.png" className="h-[100px]" />
                    <img src="bpsu.png" className="h-[100px]" />
                    <img src="bpsu.png" className="h-[100px]" />
                  </div>
                </div>

              </motion.div>

            <motion.div className="project-details ml-[30px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 0.5,
                delay: 1
              }}>
              <div className=" mt-[20px] text-lg">PROJECT DETAILS</div>

              <p> Blah blah </p>
              <p> Blah blah </p>

              <div className=" mt-[20px] text-lg">PROJECT DETAILS</div>

              <p> Blah blah </p>
              <p> Blah blah </p>

              <div className=" mt-[20px] text-lg">PROJECT DETAILS</div>

              <p> Blah blah </p>
              <p> Blah blah </p>
            </motion.div>

            <motion.div className="header mt-[20px] text-lg font-bold z-0"
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.5,
                delay: 1.25
              }}>
              Meet the Docurators
            </motion.div>

              <motion.div className="ml-[30px] mt-[20px] text-lg italic"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 1,
                delay: 2.5
              }}>
                <p>A team of passionate individuals,</p>
                <p>bringing this project into fruition.</p>
              </motion.div>

            <div className="gallery flex justify-end mr-[30px] -mt-[130px] gap-x-4 z-10">
              <motion.div className="flex flex-col items-center"
                initial={{ opacity: 0, y: -100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.75,
                  delay: 1.5,
                  ease: "easeInOut",
                }}>
                <img src="bust.avif"/>
                <div>Renz Alonzo</div>
                <div>[mail][idk]</div>
              </motion.div>

              <motion.div className="flex flex-col items-center"
                initial={{ opacity: 0, y: -100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.75,
                  delay: 1.6,
                  ease: "easeInOut",
                }}>
                <img src="bust.avif"/>
                <div>Louise de Guzman</div>
                <div>[mail][idk]</div>
              </motion.div>

              <motion.div className="flex flex-col items-center"
                initial={{ opacity: 0, y: -100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.75,
                  delay: 1.7,
                  ease: "easeInOut",
                }}>
                <img src="bust.avif"/>
                <div>Super Man</div>
                <div>[mail][idk]</div>
              </motion.div>

              <motion.div className="flex flex-col items-center"
                initial={{ opacity: 0, y: -100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.75,
                  delay: 1.8,
                  ease: "easeInOut",
                }}>
                <img src="bust.avif"/>
                <div>Wally Bayola</div>
                <div>[mail][idk]</div>
              </motion.div>
            </div>
        </div>
      </div>

        

        


        
      </div>
    </motion.div>
  );
};

export default AboutPage;