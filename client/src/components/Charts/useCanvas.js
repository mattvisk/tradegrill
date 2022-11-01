import { useRef, useEffect } from 'react'

const useCanvas = draw => {
  
  const canvasRef = useRef(null)
  
  useEffect(() => {
    
    // Get Canvas Context
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    draw(context)

    /* Future Animations
    -----------------------------*/
    // let frameCount = 0
    // let animationFrameId

    // const render = () => {
    //   frameCount++
    //   draw(context, frameCount)
    //   animationFrameId = window.requestAnimationFrame(render)
    // }
    // render()
    
    return () => {
      // window.cancelAnimationFrame(animationFrameId)
    }
  }, [draw])
  
  return canvasRef
}

export default useCanvas