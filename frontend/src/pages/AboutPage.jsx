"use client"

import "../about.css"
import { motion } from "framer-motion"
import { useState, useCallback } from "react"
import { Link } from "react-router"

// Helper function to throttle the mouse move events to improve performance
function throttle(func, delay) {
  let lastCall = 0
  return (...args) => {
    const now = new Date().getTime()
    if (now - lastCall < delay) {
      return
    }
    lastCall = now
    return func(...args)
  }
}

const AboutPage = () => {
  const [rotate, setRotate] = useState({ x: 0, y: 0 })

  // Throttled mouse move event handler to track mouse position
  const onMouseMove = useCallback(
    throttle((e) => {
      const img = e.currentTarget
      const box = img.getBoundingClientRect()
      const x = e.clientX - box.left
      const y = e.clientY - box.top
      const centerX = box.width / 2
      const centerY = box.height / 2
      const rotateX = (y - centerY) / 7 // Rotate based on vertical position
      const rotateY = (centerX - x) / 7 // Rotate based on horizontal position

      setRotate({ x: rotateX, y: rotateY })
    }, 100),
    [],
  )

  const onMouseLeave = () => {
    setRotate({ x: 0, y: 0 }) // Reset the tilt when mouse leaves
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="about-page"
    >
      <div className="grid grid-cols-2 gap-4">
        {/* Left Column */}
        <div className="left-column flex flex-col items-center justify-center pt-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            style={{ display: "inline-block" }}
          >
            <img
              src="Docurate_Logo.png"
              alt="Logo"
              onMouseMove={onMouseMove}
              onMouseLeave={onMouseLeave}
              style={{
                transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
                transition: "all 0.3s cubic-bezier(0.03, 0.98, 0.52, 0.99)",
              }}
            />
          </motion.div>

          <h1 className="white-text text-6xl font-bold">DOCURATE</h1>
          <h2 className="subtitle text-2xl">Your Document Management Solution</h2>

          <Link to="/" className="text-lg back-button mt-10">
            Back to Login
          </Link>
        </div>

        {/* Right Column */}
        <div className="right-column">
          {/* Header with University Info */}
          <motion.div
            className="header mt-[60px] text-lg font-bold flex justify-between"
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
          >
            <div className="flex flex-col gap-y-1">
              <p>A Thesis Project Submitted to the Faculty of CCST</p>
              <p>BSCS - Major in Software Development</p>
              <p>Bataan Peninsula State University</p>
            </div>

            <div>
              <div className="flex gap-x-3 mr-[10px]">
                <img src="bpsu.png" className="h-[100px]" alt="BPSU Logo" />
                <img src="bpsu.png" className="h-[100px]" alt="BPSU Logo" />
                <img src="bpsu.png" className="h-[100px]" alt="BPSU Logo" />
              </div>
            </div>
          </motion.div>

          {/* Project Details Section */}
          <motion.div
            className="project-details ml-[30px] mt-[10px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
          >
            <div className="mt-[10px] text-lg">PROJECT DETAILS</div>
            <p>
              Docurate is a web application designed to simplify the challenges of manual document creation using the
              Decision Trees algorithm. Users step through Template-based question sets to determine the type of
              document to be generated, which is fully customizable with a range of templates. Furthermore, Docurate
              also provides previews of automatic formatting of documents making it decrease the possibility of errors
              while enhancing the efficiency.
            </p>
          </motion.div>

          {/* Meet the Docurators Section */}
          <motion.div
            className="header mt-[15px] text-lg font-bold z-0"
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 1.25 }}
          >
            Meet the Docurators
          </motion.div>

          <motion.div
            className="ml-[30px] mt-[10px] text-lg italic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 2.5 }}
          >
            A team of passionate individuals, bringing this project into fruition.
          </motion.div>

          {/* Team Members Gallery */}
          <div className="gallery flex justify-end mr-[30px] gap-x-5 z-10">
            <motion.div
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: -100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 1.5, ease: "easeInOut" }}
            >
              <img src="bust.avif" alt="Renz Alonzo" />
              <div>Renz Alonzo</div>
              <div>rlpalonzo@bpsu.edu.ph</div>
            </motion.div>

            <motion.div
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: -100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 1.6, ease: "easeInOut" }}
            >
              <img src="bust.avif" alt="Louise Ceasar De Guzman" />
              <div>Louise Ceasar De Guzman</div>
              <div>lccdeguzman@bpsu.edu.ph</div>
            </motion.div>

            <motion.div
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: -100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 1.7, ease: "easeInOut" }}
            >
              <img src="bust.avif" alt="Hazee Marie Ilao" />
              <div>Hazee Marie Ilao</div>
              <div>hmdilao@bpsu.edu.ph</div>
            </motion.div>

            <motion.div
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: -100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 1.8, ease: "easeInOut" }}
            >
              <img src="bust.avif" alt="Azriel Dale Roque" />
              <div>Azriel Dale Roque</div>
              <div>addlroque@bpsu.edu.ph</div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default AboutPage

